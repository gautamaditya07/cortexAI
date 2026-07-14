# backend/src/chunker.py

import yaml
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter

def get_config():
    """Reads settings from config.yaml"""
    # Assuming the script is run from the 'backend' folder
    config_path = "config.yaml"
    if not os.path.exists(config_path):
        # Fallback if run directly inside src/
        config_path = "../config.yaml"
        
    with open(config_path, "r") as file:
        return yaml.safe_load(file)

def split_documents(documents):
    """
    Takes a list of document objects and splits them into smaller, overlapping chunks.
    """
    if not documents:
        print("No documents provided to chunk.")
        return []

    config = get_config()
    chunk_size = config.get('chunk_size', 1000)
    chunk_overlap = config.get('chunk_overlap', 200)

    print(f"Initializing chunker (Size: {chunk_size}, Overlap: {chunk_overlap})...")
    
    # Recursive splitter tries to split by paragraphs first, then sentences, then words
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", " ", ""]
    )
    
    chunks = text_splitter.split_documents(documents)
    print(f"Successfully chopped down into {len(chunks)} chunks.")
    return chunks

# --- Quick Test ---
if __name__ == "__main__":
    from document_loader import load_document
    
    # Let's load the exact same test file from the previous step
    test_file = "../data/test_doc.txt"
    
    print("Testing Chunker...")
    docs = load_document(test_file)
    
    if docs:
        chunks = split_documents(docs)
        if chunks:
            print("\n--- Preview of Chunk 1 ---")
            print(chunks[0].page_content)