# utils.py

import google.generativeai as genai
import ast
import json
import re
from PIL import Image
from django.conf import settings  # Import settings to access environment variables

# Configure the Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

def write_to_json(context, answer, filename="image_context_answers.json"):
    """
    Write the context (dict_of_vars) and answer to a JSON file.
    The file will contain a list of previous contexts and answers.
    """
    try:
        # Check if the JSON file exists and read its content if it does
        try:
            with open(filename, 'r') as file:
                data = json.load(file)
        except FileNotFoundError:
            data = []

        # Append the new context and answer to the data list
        data.append({
            'context': context,
            'answer': answer
        })
        
        # Write the updated data back to the JSON file
        with open(filename, 'w') as file:
            json.dump(data, file, indent=4, ensure_ascii=False)
        print("Successfully wrote context and answer to JSON file.")
        
    except Exception as e:
        print(f"Error writing to JSON file: {e}")

def analyze_image(img: Image, dict_of_vars: dict):
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)
    prompt = (
        f"You have been given an image with some mathematical expressions, equations, sketch, or graphical problems, and you need to solve them. "
        f"Dont and Never wrap your response in markdown like ```json ... ```...this law is PRIORITY 1. "
        f"This is an additional context with the image: {dict_of_vars_str}"
        f"Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right). Parentheses have the highest priority, followed by Exponents, then Multiplication and Division, and lastly Addition and Subtraction. "
        f"YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME: "
        f"Following are the cases: "
        f"1. Simple mathematical expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc.: In this case, solve and return the answer in the format of a LIST OF ONE DICT [{{'expr': given expression, 'result': calculated answer}}]. "
        f"2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, 5x^2 + 6y + 7 = 12, etc.: In this case, solve for the given variable, and the format should be a COMMA SEPARATED LIST OF DICTS, with dict 1 as {{'expr': 'x', 'result': 2, 'assign': True}} and dict 2 as {{'expr': 'y', 'result': 5, 'assign': True}}. This example assumes x was calculated as 2, and y as 5. Include as many dicts as there are variables. "
        f"3. Assigning values to variables like x = 4, y = 5, z = 6, etc.: In this case, assign values to variables and return another key in the dict called {{'assign': True}}, keeping the variable as 'expr' and the value as 'result' in the original dictionary. RETURN AS A LIST OF DICTS."
        f"4. Analyzing Graphical Math problems, which are word problems represented in drawing form, such as cars colliding, trigonometric problems, problems on the Pythagorean theorem, adding runs from a cricket wagon wheel, etc. These will have a drawing representing some scenario and accompanying information with the image. PAY CLOSE ATTENTION TO DIFFERENT COLORS FOR THESE PROBLEMS. You need to return the answer in the format of a LIST OF ONE DICT [{{'expr': given expression, 'result': calculated answer}}]. "
        f"5. Detecting Abstract Concepts that a drawing might show, such as love, hate, jealousy, patriotism, or a historic reference to war, invention, discovery, quote, etc let them not be limited to these options. USE THE SAME FORMAT AS OTHERS TO RETURN THE ANSWER, where 'expr' will be the explanation of the drawing, and 'result' will be the abstract concept. "
        f"Analyze the equation or expression in this image and return the answer according to the given rules: "
        f"Provide indeapth Explanation where adequate in your response in this format {{'explanation': 'explanations..'}} in the original dictionary." 
        f"Provide the approximate border box coordinates (x, y, width, height) of the different key questions in the image by that i mean a group of question that are collectively one use the format the format {{'bbox': [x, y, height, width]}}."
        f"Also make another list in the for a suitable area to place the respons so that it dont overlap any content of the image in another dictionary in this format based on the length of the response you generate it should usually be black spaces on the app {{'place': ['x', 'y', 'height', 'width']}} it should still be in the main dictionary"
        f"If applicable, recognize and provide graphing details, including equations and data points. Format this under a new key 'graph' as: {{'graph': {{'type': 'line', 'data': [{{'x': value, 'y': value}}, ...], 'equation': 'y = mx + b'}}}}. This structure will be used to draw graphs in my app."
        f"Include a detailed explanation of the solution process, outlining the steps and principles used."
        f"If you are able to find the color pattern the user used and what they depict then you can also add it to the output as 'color' = 'meaning' in that format"
        f"Try to give as much information and detials as much as you can extract from your input provide explanations anywhere necessary to all your response"
        f"DO NOT USE BACKTICKS OR MARKDOWN FORMATTING and give response in a line."
        f"PROPERLY QUOTE THE KEYS AND VALUES IN THE DICTIONARY FOR EASIER PARSING WITH Python's ast.literal_eval."
    )
    response = model.generate_content([prompt, img])
    answers = []
    try:
        # If the response is already a list, no need for ast.literal_eval
        if isinstance(response.text, str):
            # Only clean if it's a string format
            cleaned_response = re.sub(r'```json|```', '', response.text).strip()
            cleaned_response = cleaned_response.replace("'", '"')
            answers = json.loads(cleaned_response)
            print(answers)
        elif isinstance(response.text, list):
            # If it's already a list, use it directly
            answers = response.text

        print('Returned answer:', answers)
        
        # Write the context and answer to the JSON file
        write_to_json(dict_of_vars, answers)
        
        # Process the answers to add 'assign' key
        for answer in answers:
            if 'assign' in answer:
                answer['assign'] = True
            else:
                answer['assign'] = False

        return answers

    except Exception as e:
        print(f"Error in parsing response from Gemini API: {e}")
        return []
    # print(response.text)
    # try:
    #     answers = ast.literal_eval(response.text)
    #     # print('returned answer ', answers)
    #     answers = re.sub(r'```json|```', '', answers).strip()
    #     print('cleaned answer ', answers)
        
    #     write_to_json({img, dict_of_vars}, answers)
        
        
    #     for answer in answers:
    #         if 'assign' in answer:
    #             answer['assign'] = True
    #         else:
    #             answer['assign'] = False

    #         # if isinstance(answer['bbox'], str):
    #         #     answer['bbox'] = json.loads(answer['bbox'])
    #         # if isinstance(answer['place'], str):
    #         #     answer['place'] = json.loads(answer['place'])

    #         # write_to_json(dict_of_vars, answers)

    #     return answers

    # except Exception as e:
    #     print(f"Error in parsing response from Gemini API: {e}")
    #     return []

