import os
import google.generativeai as genai
from dotenv import load_dotenv

# 🚀 FORCE PYTHON TO FIND THE .ENV FILE NO MATTER WHERE TERMINAL STARTS
current_dir = os.path.dirname(os.path.abspath(__file__)) # This points to 'src'
backend_dir = os.path.dirname(current_dir)               # This goes up one level to 'backend'
env_path = os.path.join(backend_dir, '.env')             # This targets the exact .env file

# Load it using the absolute path
load_dotenv(dotenv_path=env_path)

# Extract the key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print(f"\n🚨 CRITICAL ERROR: Could not find GEMINI_API_KEY in {env_path}")
    print("Please check if your .env file exists and has the correct key!\n")

# ... (Aapka generate_answer function yahan se shuru hoga) ...
def generate_answer(question, chunks, system_prompt):
    """Generates an answer by automatically discovering available Gemini models."""
    
    try:
        # 🚀 SMART AUTO-DISCOVERY: Stop guessing names, ask Google what is available!
        valid_model_name = None
        
        # Loop through all models your specific API key has access to
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                valid_model_name = m.name
                # If we find a 'flash' model (which is lightning fast), lock it in and stop searching
                if 'flash' in valid_model_name.lower():
                    break
                    
        if not valid_model_name:
            return "System Error: Google says your API key has no text models available."

        # Print to terminal so you can see which model it successfully found!
        print(f"\n🤖 Brain Connected! Using Google Model: {valid_model_name}\n")

        # Initialize the dynamically found model (e.g., 'models/gemini-1.5-flash-8b')
        model = genai.GenerativeModel(valid_model_name)
        
        # Extract text from your RAG database chunks
        if chunks:
            context_text = "\n".join([doc.page_content for doc in chunks])
        else:
            context_text = "No document context provided. Rely on your internal knowledge."

        # Combine everything into one clean prompt
        full_prompt = f"""
        {system_prompt}
        
        DOCUMENT CONTEXT:
        {context_text}
        
        USER QUESTION: 
        {question}
        """

        # Ask the model!
        response = model.generate_content(full_prompt)
        
        return response.text.strip()
        
    except Exception as e:
        return f"System Error (Gemini): {str(e)}"