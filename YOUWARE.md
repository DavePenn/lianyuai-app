# YOUWARE Agent Guidelines for Chat Application

## Project Overview
This is a mobile-first AI chat application similar to ChatGPT, featuring session management, multi-modal input, and AI conversation capabilities.

## Architecture

### Session Management System
- **"新对话" (New Chat)**: Acts like ChatGPT's "New Chat" button, permanently available at the top of session list
- **Auto Session Creation**: When user sends message in "新对话", automatically creates new session named after message content
- **Session Switching**: Seamless switching between sessions with proper state management

### Key Files Structure
- `index.html`: Main HTML with mobile-first responsive design
- `js/app.js`: Core application logic and session management
- `chat-fix.js`: Legacy fix file (avoid modifying, use app.js instead)
- `css/`: Styling with mobile-first approach

### Session Management Logic
- **Session IDs**: Use 'new-chat' for the permanent new conversation entry, 'session_' + timestamp for regular sessions
- **createSessionWithName()**: Returns session ID and handles auto-creation when called with autoCreated=true
- **switchToSession()**: Updates UI, chat history, and session state

## Important Guidelines

### Session Management
- Never modify the "新对话" entry - it's permanent like ChatGPT's "New Chat"
- Auto-create sessions only from 'new-chat', not from manually created sessions
- Use `window.createSessionWithName(sessionName, type, autoCreated)` for session creation
- Session switching must update `window.chatSessionManager.currentSessionId`

### Message Handling
- **Primary Function**: Use `window.sendMessage()` in app.js for all message sending
- **Avoid Conflicts**: Don't modify chat-fix.js event handlers - they're disabled to prevent conflicts
- **Event Binding**: Send button and Enter key both call `window.sendMessage()`

### UI Updates
- Session list maintains "新对话" at top, new sessions inserted after it
- Chat title updates on session switch
- Welcome message shown only for "新对话"
- Proper mobile responsive design throughout

## Common Tasks

### Adding New Session Types
1. Modify `showNewSessionMenu()` in app.js
2. Add new icon and category mappings in `createSessionWithName()`
3. Update scenario creation functions if needed

### Debugging Session Issues
- Check `window.chatSessionManager.currentSessionId` for current session
- Verify session elements have correct `data-session-id` attributes
- Ensure only one event handler per action to avoid duplicates

### Mobile Responsiveness
- Use CSS custom properties for viewport height (`--vh`)
- Touch-friendly button sizes (minimum 44px)
- Proper scroll behavior in chat messages

## Technical Constraints
- Mobile-first design approach
- No backend dependency (localStorage for persistence if needed)
- Event handler conflicts between app.js and chat-fix.js must be avoided
- Session management centralized in app.js

## Troubleshooting
- **Double Session Creation**: Check for duplicate event bindings
- **Session Not Switching**: Verify `switchToSession()` updates all necessary UI elements  
- **Message Not Sending**: Ensure `window.sendMessage()` is properly exposed and called