const GEMINI_KEY = "AIzaSyD9MZfj-RMMpWxaQUscXK0mZ2uvo5unLCI";
exports.handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: '{}' };
  
  try {
    const body = JSON.parse(event.body || '{}');
    // Adaptation pour l'API Gemini (format simplifié basé sur votre structure de messages)
    const contents = (body.messages || []).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
    
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });
    
    const data = await r.json();
    
    // Reformater la réponse pour qu'elle soit compatible avec ce que votre front-end attendait de Claude
    const responseData = {
      content: [{ text: data.candidates?.[0]?.content?.parts?.[0]?.text || '' }]
    };

    return {
      statusCode: r.ok ? 200 : r.status,
      headers: CORS,
      body: JSON.stringify(responseData)
    };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
  }
};
