
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
import re
from PyPDF2 import PdfReader
from typing import List, Dict, Union
import uvicorn
import os

app = FastAPI()
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set this to your frontend's URL during production for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

conversation = None  # Initialize conversation as a global variable

@app.on_event("startup")
async def startup_event():
    load_dotenv()
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")   # Replace with your actual OpenAI API key

    # Pre-upload the document
    await upload_files(["ScottBot.pdf"])

@app.get("/")
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/upload/")
async def upload_files(files: Union[List[UploadFile], List[str]]):
    global conversation  # Declare conversation as global so we can modify it

    # get pdf text
    raw_text = get_pdf_text(files)

    # get the text chunks
    text_chunks = get_text_chunks(raw_text)

    # create vector store
    vectorstore = get_vectorstore(text_chunks)

    # create conversation chain
    conversation = get_conversation_chain(vectorstore)

    return {"detail": "Files processed successfully"}



@app.post("/ask/")
async def ask_question(data: Dict[str, str]):
    global conversation  # Declare conversation as global so we can access it

    if conversation is None:
        return {"error": "No documents uploaded yet"}

    question = data.get('question')
    if question is None:
        return {"error": "No question provided"}

    response = conversation({'question': question})
    chat_history = response['chat_history']

    return {"chat_history": chat_history}


def sanitize_text(text: str) -> str:
    return text.encode('utf-8', 'ignore').decode('utf-8')


def get_pdf_text(files):
    text = ""
    for file in files:
        if isinstance(file, str):  # If the file is a path
            with open(file, "rb") as f:
                pdf_reader = PdfReader(f)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:  # Check if page_text is not None before sanitizing
                        text += sanitize_text(page_text)
        else:  # If the file is an UploadFile instance
            pdf_reader = PdfReader(file.file)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:  # Check if page_text is not None before sanitizing
                    text += sanitize_text(page_text)

    return text





def get_text_chunks(text):
    text_splitter = CharacterTextSplitter(
        separator="\n",
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    return chunks

def get_vectorstore(text_chunks):
    embeddings = OpenAIEmbeddings()
    vectorstore = FAISS.from_texts(texts=text_chunks, embedding=embeddings)
    return vectorstore

def get_conversation_chain(vectorstore):
    llm = ChatOpenAI()
    memory = ConversationBufferMemory(
        memory_key='chat_history', return_messages=True)
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory
    )
    return conversation_chain

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)