"""
AI Prompts
Prompts for various AI-powered features
"""

CHAT_PROMPT = """You are SHAKTHI AI, a helpful assistant for female athletes in India.
You provide guidance on scholarships, mentorship, training, and safety.

Context:
- Athlete ID: {athlete_id}
- Additional context: {context}
- Conversation history: {history}

User question: {question}

Provide a helpful, encouraging response. If the question is about safety concerns, prioritize the athlete's wellbeing.
Keep responses concise and actionable.
"""

ATHLETE_SUMMARY_PROMPT = """Analyze this athlete profile and provide a comprehensive summary.

Athlete data: {athlete_data}

Provide a JSON response with:
1. summary: 2-3 sentence overview
2. strengths: array of 3 key strengths
3. areas_for_improvement: array of 2-3 areas to work on
4. recommended_next_steps: array of 3-4 actionable steps
5. profile_strength_score: number 0-100

Respond ONLY with valid JSON.
"""

SCHOLARSHIP_FIT_PROMPT = """Evaluate the match between this athlete and scholarship.

Athlete: {athlete}
Scholarship: {scholarship}

Provide a JSON response with:
1. match_score: number 0-100
2. reasoning: 2-3 sentence explanation
3. suggested_actions: array of 3 actions
4. eligibility_gaps: array of missing requirements (if any)
5. strengths_alignment: array of matching strengths

Respond ONLY with valid JSON.
"""

MENTOR_MATCH_PROMPT = """Rank these mentors for the athlete based on fit.

Athlete: {athlete}
Mentor IDs to evaluate: {mentor_ids}
Return top {top_n} matches.

Provide a JSON array where each item has:
1. mentor_id: the mentor's ID
2. match_score: number 0-100
3. explanation: 1-2 sentence why this mentor is a good match
4. key_strengths: array of 2-3 strengths the mentor brings

Respond ONLY with valid JSON array.
"""

COLLEGE_FIT_PROMPT = """Evaluate the fit between this athlete and college.

Athlete: {athlete}
College: {college}

Provide a JSON response with:
1. fit_score: number 0-100
2. reasoning: 2-3 sentence explanation
3. suggested_actions: array of 3 actions
4. sports_quota_alignment: description of sports quota fit
5. academic_streams_match: array of matching streams

Respond ONLY with valid JSON.
"""

SAFETY_GUIDANCE_PROMPT = """Provide safety guidance for this concern.

Report ID: {report_id}
Safety concern: {safety_concern}
Category: {category}

Provide a JSON response with:
1. guidance: 3-4 sentence helpful guidance
2. immediate_actions: array of 3-4 actionable steps
3. resources: array of 2-3 helpful resources or contacts
4. escalation_threshold: when to escalate to authorities

Prioritize the person's safety. Be supportive and clear.
Respond ONLY with valid JSON.
"""

MESSAGE_RISK_PROMPT = """Assess this message for safety risks in a mentor-athlete communication context.

Message: {message}
Sender ID: {sender_id}
Receiver ID: {receiver_id}
Context: {context}

Evaluate for:
- Inappropriate language
- Grooming patterns
- Harassment indicators
- Pressure tactics
- Personal information requests

Provide a JSON response with:
1. risk_score: number 0-100 (0=safe, 100=critical danger)
2. risk_level: "LOW", "MEDIUM", "HIGH", or "CRITICAL"
3. flags: array of specific concerns detected
4. recommendations: array of recommended actions
5. should_flag: boolean - should this be flagged for review
6. moderation_action: suggested action (null, warn, block, report)

Respond ONLY with valid JSON.
"""

TRAINING_RECOMMENDATION_PROMPT = """Recommend training resources for this athlete.

Athlete profile: {athlete_profile}
Focus area (optional): {focus_area}

Provide {limit} recommendations as JSON array with:
1. resource_id: placeholder ID
2. title: training topic
3. category: category name
4. reason: why this helps the athlete
5. priority: HIGH, MEDIUM, LOW

Respond ONLY with valid JSON array.
"""
