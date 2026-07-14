# backend/src/vector_store.py

import os
import yaml
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

def get_config():
    """Reads settings from config.yaml"""
    config_path = "config.yaml"
    if not os.path.exists(config_path):
        config_path = "../config.yaml"
    with open(config_path, "r") as file:
        return yaml.safe_load(file)

def create_vector_store(chunks):
    """Converts chunks to embeddings and saves them in a FAISS index."""
    if not chunks:
        print("No chunks provided to vectorize.")
        return None
        
    config = get_config()
    model_name = config.get("embedding_model", "all-MiniLM-L6-v2")
    db_path = config.get("vector_db_path", "vector_db/faiss_index")
    
    print(f"Downloading/Loading embedding model: {model_name}...")
    # This uses sentence-transformers under the hood
    embeddings = HuggingFaceEmbeddings(model_name=model_name)
    
    print("Creating FAISS index. This might take a few seconds...")
    vector_store = FAISS.from_documents(chunks, embeddings)
    
    # Save the index locally to the vector_db folder
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    vector_store.save_local(db_path)
    print(f"Vector store successfully saved to {db_path}")
    
    return vector_store

def load_vector_store():
    """Loads the existing FAISS index from disk for searching."""
    config = get_config()
    model_name = config.get("embedding_model", "all-MiniLM-L6-v2")
    db_path = config.get("vector_db_path", "vector_db/faiss_index")
    
    if not os.path.exists(db_path):
        print(f"No vector store found at {db_path}")
        return None
        
    embeddings = HuggingFaceEmbeddings(model_name=model_name)
    # allow_dangerous_deserialization is required by LangChain for local FAISS loading
    vector_store = FAISS.load_local(db_path, embeddings, allow_dangerous_deserialization=True)
    return vector_store

# --- Quick Test ---
if __name__ == "__main__":
    from document_loader import load_document
    from chunker import split_documents
    
    test_file = "../data/test_doc.txt"
    print("--- Testing Vector Store Pipeline ---")
    
    docs = load_document(test_file)
    if docs:
        chunks = split_documents(docs)
        if chunks:
            # 1. Create and save the DB
            vector_db = create_vector_store(chunks)
            
            # 2. Test a similarity search
            if vector_db:
                query = "What is this document about?"
                print(f"\nSearching Database for: '{query}'")
                
                # k=1 means fetch the 1 most relevant chunk
                results = vector_db.similarity_search(query, k=1) 
                
                print("\n✅ Top Search Result Found:")
                print(results[0].page_content)