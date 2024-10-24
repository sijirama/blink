#FROM python:3.9-alpine
FROM python:3.12-slim-bookworm

# Set the working directory inside the container
    WORKDIR /app

# Install dependencies
    COPY requirements.txt ./

    # RUN apk add --no-cache --virtual .build-deps gcc musl-dev \
    #     && apk del .build-deps

    RUN pip install --no-cache-dir -r requirements.txt 

    COPY . .

# Expose the port the Flask app runs on
    EXPOSE 5000

# Define the command to run the Flask app
    CMD ["python", "app.py"]

