@echo off
call venv\Scripts\activate
uvicorn server:app --reload --port 8000
