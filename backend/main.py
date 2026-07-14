from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil

# Import our core engine modules
from src.document_loader import load_document
from src.chunker import split_documents
from src.vector_store import create_vector_store, load_vector_store
from src.llm_agent import generate_answer

app = FastAPI(title="CortexAI API")

# Allow the Next.js frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    mode: str  # 'document', 'aiml', or 'medical'

@app.get("/")
def read_root():
    return {"message": "CortexAI Backend is running smoothly!"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    data_dir = "data"
    os.makedirs(data_dir, exist_ok=True)
    file_path = os.path.join(data_dir, file.filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        docs = load_document(file_path)
        chunks = split_documents(docs)
        create_vector_store(chunks)
        return {"message": f"Successfully processed and indexed {file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask")
async def ask_question(request: QueryRequest):
    """Retrieves relevant context based on mode and generates an answer."""
    
    # --- MODE 1: RAG DOCUMENT CORE ---
    if request.mode == "document":
        vector_db = load_vector_store()
        if not vector_db:
            return {"answer": "Error: Please upload a document first to initialize the RAG Core!"}
        
        chunks = vector_db.similarity_search(request.question, k=5)
        system_prompt = "You are CortexAI. Answer the question using ONLY the provided document context. Be highly factual."
        answer = generate_answer(request.question, chunks, system_prompt)
        return {"answer": answer}

    # --- MODE 2: AI/ML NODE ---
    elif request.mode == "aiml":
        system_prompt = """
        You are the CortexAI AI/ML Node. You are a senior expert in Neural Networks, Deep Learning, 
        and LLM architectures. Provide deep technical insights, use professional language, and give code examples where helpful.
        """
        answer = generate_answer(request.question, [], system_prompt)
        return {"answer": answer}

    # --- MODE 3: BIO-MED NODE ---
    elif request.mode == "medical":
        system_prompt = """
        You are the CortexAI Bio-Med Node. You are a highly advanced medical researcher and biology expert. 
        Provide detailed, scientific, and factual answers. 
        Start your answer with a professional tone. Disclaimer: State that this information is for educational purposes only.
        """
        answer = generate_answer(request.question, [], system_prompt)
        return {"answer": answer}

    else:
        raise HTTPException(status_code=400, detail="Invalid system mode selected.")