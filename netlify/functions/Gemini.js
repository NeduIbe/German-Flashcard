/*
 * netlify/functions/gemini.js
 * This is your secure serverless function.
 * It runs on Netlify's servers, not in the user's browser.
 */

exports.handler = async function(event, context) {
    // 1. Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // 2. Get the payload (the user's chat history) from the frontend request
    const payload = JSON.parse(event.body);

    // 3. Get your secret API key from Netlify's environment variables
    //    You must set this in the Netlify UI.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "API key is not set. Did you add GEMINI_API_KEY to your Netlify environment variables?" })
        };
    }

    // 4. Set up the Google API URL
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
        // 5. Securely call the Google Gemini API from the server
        const googleResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) // Pass the original payload to Google
        });

        if (!googleResponse.ok) {
            const errorBody = await googleResponse.text();
            console.error("Google API Error:", errorBody);
            return {
                statusCode: googleResponse.status,
                body: JSON.stringify({ error: `Google API request failed: ${errorBody}` })
            };
        }

        // 6. Get the JSON response from Google
        const data = await googleResponse.json();

        // 7. Send Google's response back to your frontend
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error("Error in serverless function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};