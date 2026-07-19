package com.fanflow.backend.service;

import com.fanflow.backend.model.Concession;
import com.fanflow.backend.model.Gate;
import com.fanflow.backend.model.StadiumStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final StadiumService stadiumService;
    private final RestTemplate restTemplate;

    public GeminiService(StadiumService stadiumService) {
        this.stadiumService = stadiumService;
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> getChatResponse(String userMessage, String currentLocation) {
        StadiumStatus currentStatus = stadiumService.getStadiumStatus();

        // 1. Build the system context (RAG)
        String systemContext = buildSystemContext(currentStatus);

        // 2. Build the final prompt
        String finalPrompt = systemContext + "\n\n" +
                "User's Current Location: " + (currentLocation != null ? currentLocation : "Unknown") + "\n" +
                "User Question: " + userMessage + "\n\n" +
                "Response Requirements:\n" +
                "1. Answer the user's question accurately using the stadium context provided.\n" +
                "2. Keep the answer concise, friendly, and helper-oriented.\n" +
                "3. If they ask about routing or where to go, provide a list of steps.\n" +
                "4. If there is a bottleneck or crowd at their location/concession of choice, recommend an alternative.\n" +
                "5. Also, return a JSON block at the end (or inside) containing key structural fields so the UI can draw route indicators. " +
                "Strictly include a JSON object like this at the end of the text on its own line: {\"navigationPath\":[\"Location1\",\"Location2\"],\"suggestedAlternative\":\"Name\"} if applicable, otherwise {\"navigationPath\":[],\"suggestedAlternative\":null}.";

        // 3. Check if Gemini API key is configured
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("GEMINI_API_KEY")) {
            return generateMockResponse(userMessage, currentLocation, currentStatus);
        }

        try {
            // Call Gemini API
            String url = apiUrl + "?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Construct payload
            Map<String, Object> textPart = Map.of("text", finalPrompt);
            Map<String, Object> parts = Map.of("parts", List.of(textPart));
            Map<String, Object> contents = Map.of("contents", List.of(parts));

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(contents, headers);
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, requestEntity, Map.class);

            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                Map body = responseEntity.getBody();
                List candidates = (List) body.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map candidate = (Map) candidates.getFirst();
                    Map content = (Map) candidate.get("content");
                    if (content != null) {
                        List partsList = (List) content.get("parts");
                        if (partsList != null && !partsList.isEmpty()) {
                            Map part = (Map) partsList.getFirst();
                            String textResponse = (String) part.get("text");
                            return parseResponse(textResponse);
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage() + ". Falling back to local intelligence.");
        }

        return generateMockResponse(userMessage, currentLocation, currentStatus);
    }

    private String buildSystemContext(StadiumStatus status) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are FanFlow AI, the official GenAI Stadium Guide for the FIFA World Cup 2026 at NYNJ Stadium (MetLife Stadium).\n");
        sb.append("Here is the verified stadium directory and current crowd statuses:\n\n");

        sb.append("--- LIVE CONCESSION WAITING TIMES ---\n");
        for (Concession c : status.getConcessions()) {
            sb.append("- ").append(c.getName()).append(" (")
                    .append(c.getType()).append("): Located at ")
                    .append(c.getLocation()).append(". Current Wait Time: ")
                    .append(c.getWaitTimeMinutes()).append(" mins (Status: ")
                    .append(c.getStatus()).append(").\n");
        }

        sb.append("\n--- LIVE GATE ENTRY WAITING TIMES ---\n");
        for (Gate g : status.getGates()) {
            sb.append("- ").append(g.getName()).append(". Current Wait Time: ")
                    .append(g.getWaitTimeMinutes()).append(" mins (Status: ")
                    .append(g.getStatus()).append(").\n");
        }

        sb.append("\n--- STADIUM DIRECTORY & FACILITIES ---\n");
        sb.append("- Restrooms: Located near Sections 110, 120, 130, 208, 222, 305, 325.\n");
        sb.append("- First Aid / Medical Stations: Located at Section 112 (Level 1) and Section 314 (Level 3).\n");
        sb.append("- Accessibility Services: Elevators located at Gate A and Gate C. Wheelchair seating rows are at the top of Level 1 (Sections 105-115).\n");
        sb.append("- Sensory Room: Located near Section 202 (Level 2). Offers a quiet space for neurodivergent fans.\n");
        sb.append("- Merchandising Hub: Large Official FIFA Store near Gate B. Smaller pods at Sections 102 and 140.\n");

        sb.append("\n--- TRANSPORTATION & TRANSIT INFO ---\n");
        sb.append("- Rail Transit: Metro Rail Train station is directly outside Gate A (North Entry).\n");
        sb.append("- Shuttle Buses: Parking shuttles and city express buses load outside Gate C (South Entry).\n");
        sb.append("- Rideshare / Taxi: Uber/Lyft pickup zone is located in Lot E outside Gate D (West Entry).\n");

        sb.append("\n--- STADIUM LAYOUT MAP ---\n");
        sb.append("- Level 1 contains Sections 101 to 143 (circular loop).\n");
        sb.append("- Level 2 contains Sections 201 to 240.\n");
        sb.append("- Level 3 contains Sections 301 to 350.\n");
        sb.append("- Gates are distributed around the exterior: Gate A (North), Gate B (East), Gate C (South), Gate D (West).\n");

        return sb.toString();
    }

    private Map<String, Object> parseResponse(String rawText) {
        Map<String, Object> result = new HashMap<>();
        String cleanText = rawText;
        List<String> navPath = new ArrayList<>();
        String alternative = null;

        try {
            // Find JSON block in response
            int jsonStartIndex = rawText.lastIndexOf("{");
            int jsonEndIndex = rawText.lastIndexOf("}");
            if (jsonStartIndex != -1 && jsonEndIndex != -1 && jsonEndIndex > jsonStartIndex) {
                String jsonStr = rawText.substring(jsonStartIndex, jsonEndIndex + 1);
                cleanText = rawText.substring(0, jsonStartIndex).trim();

                // Simple manual parsing to avoid heavy JSON parser dependency
                if (jsonStr.contains("\"navigationPath\"")) {
                    int arrStart = jsonStr.indexOf("[");
                    int arrEnd = jsonStr.indexOf("]");
                    if (arrStart != -1 && arrEnd != -1 && arrEnd > arrStart) {
                        String itemsStr = jsonStr.substring(arrStart + 1, arrEnd);
                        if (!itemsStr.trim().isEmpty()) {
                            String[] items = itemsStr.split(",");
                            for (String item : items) {
                                navPath.add(item.replace("\"", "").trim());
                            }
                        }
                    }
                }
                if (jsonStr.contains("\"suggestedAlternative\"")) {
                    int altStart = jsonStr.indexOf("\"suggestedAlternative\"");
                    String sub = jsonStr.substring(altStart);
                    int colIndex = sub.indexOf(":");
                    if (colIndex != -1) {
                        String val = sub.substring(colIndex + 1).replace("}", "").trim();
                        if (!val.equals("null") && val.contains("\"")) {
                            alternative = val.replace("\"", "").trim();
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to parse AI navigation path JSON: " + e.getMessage());
        }

        result.put("reply", cleanText);
        result.put("navigationPath", navPath);
        result.put("suggestedAlternative", alternative);
        return result;
    }

    private Map<String, Object> generateMockResponse(String userMessage, String currentLocation, StadiumStatus status) {
        Map<String, Object> result = new HashMap<>();
        String query = userMessage.toLowerCase();
        String reply;
        List<String> path = new ArrayList<>();
        String alternative = null;

        if (query.contains("food") || query.contains("eat") || query.contains("concession") || query.contains("burger") || query.contains("taco")) {
            // Query about food
            Concession crowded = null;
            Concession clear = null;
            for (Concession c : status.getConcessions()) {
                if (c.getType().equals("Food")) {
                    if (c.getStatus().equals("CROWDED")) {
                        crowded = c;
                    } else if (c.getStatus().equals("CLEAR")) {
                        clear = c;
                    }
                }
            }

            if (query.contains("taco") || (crowded != null && query.contains(crowded.getName().toLowerCase()))) {
                reply = "Currently, **Kickoff Tacos** (Section 108) is highly crowded with a wait time of " + 
                        (crowded != null ? crowded.getWaitTimeMinutes() : 25) + " minutes. \n\n" +
                        "I highly recommend going to **Corner Kick Burgers** (Section 124) instead, where the wait time is only " +
                        (clear != null ? clear.getWaitTimeMinutes() : 10) + " minutes. \n\n" +
                        "**Route to alternative:**\n1. From " + (currentLocation != null ? currentLocation : "your seat") + ", walk along the Level 1 main concourse clockwise.\n2. Pass the Merchandising Hub near Section 102.\n3. Corner Kick Burgers will be on your left near Section 124.";
                
                path = Arrays.asList(currentLocation != null ? currentLocation : "Current Seat", "Concourse Section 102", "Corner Kick Burgers (Sec 124)");
                alternative = "Corner Kick Burgers";
            } else {
                reply = "Here are the dining choices nearby:\n" +
                        "- **Corner Kick Burgers** (Section 124): " + (clear != null ? clear.getWaitTimeMinutes() : 10) + " mins (CLEAR)\n" +
                        "- **Kickoff Tacos** (Section 108): " + (crowded != null ? crowded.getWaitTimeMinutes() : 25) + " mins (CROWDED)\n\n" +
                        "Would you like directions to any of these spots?";
                path = Collections.emptyList();
            }

        } else if (query.contains("exit") || query.contains("leave") || query.contains("gate") || query.contains("train") || query.contains("metro")) {
            // Leaving/Gate questions
            Gate gateB = null;
            Gate gateA = null;
            for (Gate g : status.getGates()) {
                if (g.getId().equals("gate-b")) gateB = g;
                if (g.getId().equals("gate-a")) gateA = g;
            }

            if (query.contains("metro") || query.contains("train") || query.contains("gate a") || query.contains("gate b")) {
                reply = "If you are planning to take the Metro Rail Train, the station is directly outside **Gate A (North Entry)**. \n\n" +
                        "Note: **Gate B (East Entry)** is currently heavily crowded (" + (gateB != null ? gateB.getWaitTimeMinutes() : 35) + " mins wait). " +
                        "For a smoother departure, head towards **Gate A**, which is clear with only a " + (gateA != null ? gateA.getWaitTimeMinutes() : 8) + "-minute queue.\n\n" +
                        "**Walking route:**\n1. Follow signs for Section 101-110 to reach the North Concourse.\n2. Exit through the double glass doors directly into the Gate A plaza.";
                path = Arrays.asList(currentLocation != null ? currentLocation : "Current Seat", "North Concourse Section 101", "Gate A Plaza", "Metro Rail Station");
                alternative = "Gate A (North Entry)";
            } else {
                reply = "For general exiting:\n" +
                        "- **Gate A (North Entry)**: " + (gateA != null ? gateA.getWaitTimeMinutes() : 8) + " mins (CLEAR) - best for Metro Train.\n" +
                        "- **Gate B (East Entry)**: " + (gateB != null ? gateB.getWaitTimeMinutes() : 35) + " mins (CROWDED) - best for East parking lot.\n" +
                        "- **Gate D (West Entry)**: 5 mins (CLEAR) - best for Uber/Lyft pickup.\n\n" +
                        "Which one matches your transportation mode?";
            }

        } else if (query.contains("restroom") || query.contains("toilet") || query.contains("bathroom")) {
            reply = "Restrooms are located nearby at **Section 110** and **Section 120**. \n\n" +
                    "To avoid lines, the restrooms at Section 120 are usually less busy during match play. \n\n" +
                    "**Directions:**\n1. Walk toward Section 120 along the main concourse.\n2. Restrooms will be on your right, next to the concession booths.";
            path = Arrays.asList(currentLocation != null ? currentLocation : "Current Seat", "Concourse Section 120", "Restroom Area");

        } else if (query.contains("accessible") || query.contains("wheelchair") || query.contains("elevator")) {
            reply = "Wheelchair-accessible routes and elevator access are located near **Gate A** and **Gate C**. \n\n" +
                    "Additionally, designated accessible seating is available at the top of Level 1 (Sections 105-115).\n\n" +
                    "If you require assistance, please inform stadium staff or visit the Guest Services Booth near Section 112.";
            path = Arrays.asList(currentLocation != null ? currentLocation : "Current Seat", "Elevator lobby Gate A", "Accessible seating level 1");

        } else if (query.contains("sensory") || query.contains("quiet") || query.contains("calm")) {
            reply = "A specialized **Sensory Room** is located near **Section 202 (Level 2)**. This room is soundproofed and equipped with sensory toys, quiet spaces, and trained facilitators to assist neurodivergent fans. \n\n" +
                    "**Directions:**\n1. Take the elevator near Gate A to Level 2.\n2. Turn left and walk down the corridor to Section 202. The Sensory Room is clearly marked on your right.";
            path = Arrays.asList(currentLocation != null ? currentLocation : "Current Seat", "Gate A Elevator", "Level 2 Corridor", "Sensory Room (Sec 202)");

        } else {
            reply = "Welcome to the FIFA World Cup 2026! I am **FanFlow AI**, your smart stadium assistant.\n\n" +
                    "I can help you with:\n" +
                    "- Finding the shortest concession wait times (e.g. *'where to get tacos?'*)\n" +
                    "- Real-time gate queues and public transit navigation (e.g. *'how to get to the train?'*)\n" +
                    "- Accessible services, restrooms, first aid, and sensory rooms.\n\n" +
                    "What can I help you find today?";
        }

        result.put("reply", reply);
        result.put("navigationPath", path);
        result.put("suggestedAlternative", alternative);
        return result;
    }
}
