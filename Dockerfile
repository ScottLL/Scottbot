# Use a base image
FROM python:3.8

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements.txt file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .


# Expose a port if your application listens on a specific port
EXPOSE 8000

# Set the command to run your application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
