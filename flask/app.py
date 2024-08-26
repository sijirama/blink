import os
from flask import Flask, request, jsonify
from openai import OpenAI

from dotenv import load_dotenv

load_dotenv()


app = Flask(__name__)
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


def process_alert(content):
    # Step 1: Determine if it's an alert
    is_alert_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an AI that determines if a given text describes a dangerous situation that requires an alert. Respond with 1 for yes or 0 for no."},
            {"role": "user", "content": content}
        ]
    )
    is_alert = int(is_alert_response.choices[0].message.content.strip())

    if not is_alert:
        return {"isAlert": 0}

    # Step 2: Translate to clear, concise English
    translation_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Translate the following alert into a brief, clear summary for other people viewing the alert to understand:"},
            {"role": "user", "content": content}
        ]
    )
    translated_content = translation_response.choices[0].message.content.strip(
    )

    # Step 3: Provide next steps
    next_steps_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Provide 2-3 brief, short, very short and precise, actionable steps for this emergency, don't mention any local services like 911 or the fbi, make it general so that everyone will understand:"},
            {"role": "user", "content": translated_content}
        ]
    )
    next_steps = next_steps_response.choices[0].message.content.strip()

    # Step 4: Determine urgency score
    urgency_response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "Rate the urgency of the following situation on a scale of 1-10, where 10 is most urgent. Respond with only the number."},
            {"role": "user", "content": translated_content}
        ]
    )
    urgency_score = int(urgency_response.choices[0].message.content.strip())

    return {
        "isAlert": 1,
        "translatedContent": translated_content,
        "nextSteps": next_steps,
        "urgencyScore": urgency_score
    }


@app.route("/process_alert", methods=['POST'])
def process_alert_endpoint():
    data = request.json
    content = data.get('content')
    if not content:
        return jsonify({"error": "No content provided"}), 400

    result = process_alert(content)
    return jsonify(result)


@app.route("/healthcheck", methods=['GET'])
def healthcheck_endpoint():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host='0.0.0.0', port='5000')
