import os
from flask import Flask, request, jsonify
from openai import OpenAI
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Dict, Union
import logging

# NOTE: Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Initialize AI clients
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel('gemini-1.5-flash-001')


class AIProcessor:
    @staticmethod
    async def process_with_gpt(prompt: str, system_message: str, model: str = "gpt-4") -> str:
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"GPT processing failed: {e}")
            return None

    @staticmethod
    async def process_with_gemini(prompt: str, system_message: str) -> str:
        try:
            combined_prompt = f"{system_message}\n\nUser input: {prompt}"
            response = gemini_model.generate_content(combined_prompt,
                                                     safety_settings=[
                                                         {
                                                             "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                                                             "threshold": "BLOCK_NONE",
                                                         },
                                                         {
                                                             "category": "HARM_CATEGORY_HATE_SPEECH",
                                                             "threshold": "BLOCK_NONE",
                                                         },
                                                         {
                                                             "category": "HARM_CATEGORY_HARASSMENT",
                                                             "threshold": "BLOCK_NONE",
                                                         },
                                                         {
                                                             "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                                                             "threshold": "BLOCK_NONE",
                                                         }
                                                     ],
                                                     generation_config={
                                                         "temperature": 0.3,
                                                         "candidate_count": 1,
                                                         "top_p": 0.8,
                                                         "top_k": 40
                                                     })
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini processing failed: {e}")
            return None

    @staticmethod
    async def process_with_fallback(prompt: str, system_message: str) -> str:
        # Try GPT first
        gpt_response = await AIProcessor.process_with_gpt(prompt, system_message)
        if gpt_response:
            return gpt_response

        # Fallback to Gemini
        gemini_response = await AIProcessor.process_with_gemini(prompt, system_message)
        if gemini_response:
            return gemini_response

        # If both fail, raise exception
        raise Exception("Both GPT and Gemini processing failed")


async def process_alert(content: str) -> Dict[str, Union[int, str]]:
    try:
        # System messages for different processing steps
        SYSTEM_MESSAGES = {
            "is_alert": "You are an AI that determines if a given text describes a dangerous situation that requires an alert. Respond with 1 for yes or 0 for no. Only consider serious threats that require immediate attention or external help. Minor incidents should be marked as 0.",
            "translate": "Translate the following alert into a brief, clear English summary. Focus on factual information and include specific location details if provided. Omit personal feelings or non-essential context.",
            "next_steps": "Provide 2-3 brief, actionable steps for people nearby to respond to this emergency. Keep instructions universal and avoid referencing specific local services.",
            "urgency": "Rate the urgency on a scale of 1-10, where 10 is most urgent. Consider both immediate danger and need for authority intervention. Only rate 7+ if police/emergency services are needed. Respond with only the number."
        }

        # Step 1: Determine if it's an alert
        is_alert_str = await AIProcessor.process_with_fallback(content, SYSTEM_MESSAGES["is_alert"])
        is_alert = int(is_alert_str)

        if not is_alert:
            return {"isAlert": 0}

        # Step 2: Translate content
        translated_content = await AIProcessor.process_with_fallback(content, SYSTEM_MESSAGES["translate"])

        # Step 3: Get next steps
        next_steps = await AIProcessor.process_with_fallback(translated_content, SYSTEM_MESSAGES["next_steps"])

        # Step 4: Get urgency score
        urgency_str = await AIProcessor.process_with_fallback(translated_content, SYSTEM_MESSAGES["urgency"])
        urgency_score = int(urgency_str)

        return {
            "isAlert": 1,
            "translatedContent": translated_content,
            "nextSteps": next_steps,
            "urgencyScore": urgency_score,
        }
    except Exception as e:
        logger.error(f"Alert processing failed: {e}")
        return {"error": str(e)}, 500


@app.route("/process_alert", methods=['POST'])
async def process_alert_endpoint():
    data = request.json
    content = data.get('content')

    if not content:
        return jsonify({"error": "No content provided"}), 400

    result = await process_alert(content)
    return jsonify(result)


@app.route("/healthcheck", methods=['GET'])
def healthcheck_endpoint():
    return jsonify({
        "status": "ok",
        "gpt_available": bool(os.environ.get("OPENAI_API_KEY")),
        "gemini_available": bool(os.environ.get("GEMINI_API_KEY"))
    })


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
