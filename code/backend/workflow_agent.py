"""
Agent-based PDF extraction workflow using OpenAI SDK.
Replicates the TypeScript agent workflow for extracting insurance form data from PDFs.
"""
import json
from typing import Dict, Any
from openai import AsyncOpenAI
from pydantic import BaseModel, Field
from typing import Optional


class FormDataSchema(BaseModel):
	"""Schema for the extracted form data matching the agent's output schema."""
	gender: Optional[str] = Field(None, description="Gender: 'm', 'f', or 'other'")
	age: Optional[str] = Field(None, description="Age in years")
	marital_status: Optional[str] = Field(None, description="Marital status: 'single', 'married', 'divorced', 'widowed'")
	height_cm: Optional[str] = Field(None, description="Height in centimeters")
	weight_kg: Optional[str] = Field(None, description="Weight in kilograms")
	bmi: Optional[str] = Field(None, description="BMI (Body Mass Index)")
	smoking: Optional[str] = Field(None, description="Smoking status: 'true' or 'false'")
	packs_per_week: Optional[str] = Field(None, description="Number of cigarette packs per week")
	drug_use: Optional[str] = Field(None, description="Drug use: 'true' or 'false'")
	drug_frequency: Optional[str] = Field(None, description="Frequency of drug use")
	drug_type: Optional[str] = Field(None, description="Drug risk type: 'safe', 'warning', 'danger', 'unknown'")
	staying_abroad: Optional[str] = Field(None, description="Staying abroad: 'true' or 'false'")
	abroad_type: Optional[str] = Field(None, description="Abroad risk type: 'safe', 'warning', 'danger', 'unknown'")
	dangerous_sports: Optional[str] = Field(None, description="Dangerous sports: 'true' or 'false'")
	sport_type: Optional[str] = Field(None, description="Sport risk type: 'safe', 'warning', 'danger', 'unknown'")
	medical_issue: Optional[str] = Field(None, description="Medical issues: 'true' or 'false'")
	medical_type: Optional[str] = Field(None, description="Medical risk type: 'safe', 'warning', 'danger', 'unknown'")
	doctor_visits: Optional[str] = Field(None, description="Doctor visits: 'true' or 'false'")
	visit_type: Optional[str] = Field(None, description="Visit type: 'physician', 'specialist', 'hospital'")
	regular_medication: Optional[str] = Field(None, description="Regular medication: 'true' or 'false'")
	medication_type: Optional[str] = Field(None, description="Medication risk type: 'safe', 'warning', 'danger', 'unknown'")
	sports_activity_h_per_week: Optional[str] = Field(None, description="Sports activity hours per week")
	earning_chf: Optional[str] = Field(None, description="Annual earning in CHF")
	birthdate: Optional[str] = Field(None, description="Birthdate in YYYY-MM-DD format")


AGENT_INSTRUCTIONS = """You are an expert data extractor. 
Your task is to read a PDF and return structured form data in the **exact JSON schema** defined by the function calling schema.  

### Rules:
1. Output strictly as per the schema — do not add or remove keys.  
2. If a field is clearly indicated in the PDF, extract it accurately.  
3. If a field is **unclear, vague, or not obvious**, use "unknown" for string-like fields.  
4. If a field is **completely missing** (no mention or hint in the PDF):
- Leave it empty → "" for string fields
- Use null for numeric or boolean fields
5. Normalize all numeric values:
- height_cm → centimeters  
- weight_kg → kilograms  
- bmi → calculated or given directly  
- earning_chf → integer (rounded if needed)
6. Booleans must be literal "true" or "false" strings (not actual booleans).
7. Do **not** include explanations, text, or formatting — only call the function with JSON arguments exactly matching the schema.

### Field meaning hints:
- gender: "male" or "female" → "m" or "f"
- marital_status: "single", "married", "divorced", "widowed", etc.
- drug_type, abroad_type, sport_type, medical_type, medication_type: "safe", "warning", "danger", or "unknown"
- If a risk/type/label cannot be confidently inferred → "unknown"
- Use best judgment for context-based inference; otherwise follow the empty/unknown rules above.

Now, read the provided PDF content and call the function `extract_form_data` with the extracted values.
"""


async def run_extraction_agent(client: AsyncOpenAI, pdf_base64: str) -> Dict[str, Any]:
	"""
	Run the extraction agent to extract form data from PDF text.
	
	Args:
		client: AsyncOpenAI client instance
		pdf_text: Extracted text content from the PDF
		
	Returns:
		Dict containing the extracted form data
	"""
	
	# Define the function schema for structured output
	tools = [
		{
			"type": "function",
			"function": {
				"name": "extract_form_data",
				"description": "Extract structured insurance form data from the PDF content",
				"parameters": {
					"type": "object",
					"properties": {
						"gender": {"type": "string", "description": "Gender: 'm', 'f', or 'other'"},
						"age": {"type": "string", "description": "Age in years"},
						"marital_status": {"type": "string", "description": "Marital status: 'single', 'married', 'divorced', 'widowed'"},
						"height_cm": {"type": "string", "description": "Height in centimeters"},
						"weight_kg": {"type": "string", "description": "Weight in kilograms"},
						"bmi": {"type": "string", "description": "BMI (Body Mass Index)"},
						"smoking": {"type": "string", "description": "Smoking status: 'true' or 'false'"},
						"packs_per_week": {"type": "string", "description": "Number of cigarette packs per week"},
						"drug_use": {"type": "string", "description": "Drug use: 'true' or 'false'"},
						"drug_frequency": {"type": "string", "description": "Frequency of drug use"},
						"drug_type": {"type": "string", "description": "Drug risk type: 'safe', 'warning', 'danger', 'unknown'"},
						"staying_abroad": {"type": "string", "description": "Staying abroad: 'true' or 'false'"},
						"abroad_type": {"type": "string", "description": "Abroad risk type: 'safe', 'warning', 'danger', 'unknown'"},
						"dangerous_sports": {"type": "string", "description": "Dangerous sports: 'true' or 'false'"},
						"sport_type": {"type": "string", "description": "Sport risk type: 'safe', 'warning', 'danger', 'unknown'"},
						"medical_issue": {"type": "string", "description": "Medical issues: 'true' or 'false'"},
						"medical_type": {"type": "string", "description": "Medical risk type: 'safe', 'warning', 'danger', 'unknown'"},
						"doctor_visits": {"type": "string", "description": "Doctor visits: 'true' or 'false'"},
						"visit_type": {"type": "string", "description": "Visit type: 'physician', 'specialist', 'hospital'"},
						"regular_medication": {"type": "string", "description": "Regular medication: 'true' or 'false'"},
						"medication_type": {"type": "string", "description": "Medication risk type: 'safe', 'warning', 'danger', 'unknown'"},
						"sports_activity_h_per_week": {"type": "string", "description": "Sports activity hours per week"},
						"earning_chf": {"type": "string", "description": "Annual earning in CHF"},
						"birthdate": {"type": "string", "description": "Birthdate in YYYY-MM-DD format"}
					},
					"required": []  # All fields are optional
				}
			}
		}
	]
	print(f"PDF text length: {len(pdf_base64)} characters")
	print(f"First 500 chars: {pdf_base64[:50]}")
	# Create the chat completion with function calling
	response = await client.chat.completions.create(
		model="gpt-5-chat-latest",
		messages=[
			{"role": "system", "content": AGENT_INSTRUCTIONS},
			{
				"role": "user",
				"content": [
					{
         				"type": "text",
						"text": "Extract the form data from this PDF content."
					},
					{
						"type": "file",
						"file": {
							"filename": "eqwdw.pdf",
							"file_data": f"data:application/pdf;base64,{pdf_base64}",
						}
					}
				]
			}
		],
		tools=tools,
		tool_choice={"type": "function", "function": {"name": "extract_form_data"}},
		temperature=1.03,
		top_p=1,
		max_tokens=5433
	)
	# Extract the function call result
	message = response.choices[0].message
	
	if message.tool_calls and len(message.tool_calls) > 0:
		function_call = message.tool_calls[0].function
		arguments = json.loads(function_call.arguments)
		
		# Convert string booleans to actual booleans for our backend
		result = {}
		for key, value in arguments.items():
			if value in ["true", "false"]:
				result[key] = value == "true"
			elif value == "":
				result[key] = None
			elif value == "unknown":
				result[key] = "unknown"
			else:
				# Try to convert numeric strings to numbers
				if key in ["age", "height_cm", "weight_kg", "bmi", "packs_per_week", 
						"drug_frequency", "sports_activity_h_per_week", "earning_chf"]:
					try:
						if "." in str(value):
							result[key] = float(value)
						else:
							result[key] = int(value)
					except (ValueError, TypeError):
						result[key] = value
				else:
					result[key] = value
		
		return result
	
	# If no function call, return empty dict
	return {}


async def extract_from_pdf_bytes(client: AsyncOpenAI, pdf_content: bytes) -> Dict[str, Any]:
	"""
	EPDF page to base64 extraction and runs the extraction agent.
	
	Args:
		client: AsyncOpenAI client instance
		pdf_content: Raw PDF bytes
		
	Returns:
		Dict containing the extracted form data
	"""
	import base64

	pdf_base64 = base64.b64encode(pdf_content).decode("ascii")
	print("PDF base64 encoded successfully, length:", len(pdf_base64))
	return await run_extraction_agent(client, pdf_base64)