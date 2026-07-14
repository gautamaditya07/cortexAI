# backend/src/document_loader.py

import os
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader

def load_document(file_path: str):
    """
    Loads a PDF, DOCX, or TXT file and returns a list of document objects.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Error: The file {file_path} does not exist.")

    # Get the file extension
    ext = os.path.splitext(file_path)[-1].lower()
    
    try:
        if ext == '.pdf':
            print(f"Loading PDF: {file_path}")
            loader = PyPDFLoader(file_path)
        elif ext == '.docx':
            print(f"Loading DOCX: {file_path}")
            loader = Docx2txtLoader(file_path)
        elif ext == '.txt':
            print(f"Loading TXT: {file_path}")
            loader = TextLoader(file_path)
        else:
            raise ValueError(f"Unsupported file format: {ext}. Only PDF, DOCX, and TXT are allowed.")
            
        documents = loader.load()
        print(f"Successfully loaded {len(documents)} pages/sections.")
        return documents
        
    except Exception as e:
        print(f"Failed to load document: {e}")
        return None

# --- Quick Test ---
if __name__ == "__main__":
    # Create a dummy text file to test the loader
    test_file = "../data/test_doc.txt"
    os.makedirs("../data", exist_ok=True)
    
    with open(test_file, "w") as f:
        f.write("This is a test document for the CortexAI system. It contains some basic text.")
        
    print("Testing Document Loader...")
    docs = load_document(test_file)
    
    if docs:
        print("\nExtracted Text:")
        print(docs[0].page_content)