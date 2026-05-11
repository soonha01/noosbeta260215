package com.noos.backend.chat.service;

import com.noos.backend.chat.dto.ChatMessage;
import com.noos.backend.chat.dto.ChatRoom;
import com.noos.backend.chat.mapper.ChatMapper;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import static com.noos.backend.auth.session.AuthSessionKeys.LOGIN_USER_ID;
import static com.noos.backend.auth.session.AuthSessionKeys.LOGIN_USER_ROLE;

@Service
public class ChatService {

    private final ChatMapper chatMapper;

    public ChatService(ChatMapper chatMapper) {
        this.chatMapper = chatMapper;
    }

    @Transactional
    public ChatMessage saveChatMessage(ChatMessage message) {
        ChatMessage normalized = normalizeMessage(message, ChatMessage.MessageType.CHAT);
        upsertRoom(normalized);
        chatMapper.insertMessage(normalized);
        chatMapper.updateRoomAfterMessage(
                normalized.getRoomId(),
                normalized.getContent(),
                !"ADMIN".equals(normalized.getRole())
        );
        return normalized;
    }

    @Transactional
    public ChatMessage joinRoom(ChatMessage message) {
        ChatMessage normalized = normalizeMessage(message, ChatMessage.MessageType.JOIN);
        upsertRoom(normalized);
        chatMapper.insertMessage(normalized);
        return normalized;
    }

    @Transactional
    public ChatMessage leaveRoom(ChatMessage message) {
        ChatMessage normalized = normalizeMessage(message, ChatMessage.MessageType.LEAVE);
        upsertRoom(normalized);
        chatMapper.insertMessage(normalized);
        chatMapper.closeRoom(normalized.getRoomId());
        return normalized;
    }

    @Transactional(readOnly = true)
    public List<ChatRoom> findAllRooms(HttpSession session) {
        requireAdmin(session);
        return chatMapper.findAllRooms();
    }

    @Transactional
    public List<ChatMessage> findHistory(String roomId, HttpSession session) {
        if (!isAdmin(session) && !roomId.equals(String.valueOf(sessionUserId(session)))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Chat room access denied.");
        }
        if (isAdmin(session)) {
            chatMapper.markRoomRead(roomId);
        }
        return chatMapper.findMessagesByRoomId(roomId);
    }

    private void upsertRoom(ChatMessage message) {
        ChatRoom room = new ChatRoom(message.getRoomId(), message.getSender());
        room.setUserId(parseRoomUserId(message.getRoomId()));
        room.setStatus("ACTIVE");
        chatMapper.upsertRoom(room);
    }

    private ChatMessage normalizeMessage(ChatMessage message, ChatMessage.MessageType type) {
        if (message == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message body is required.");
        }
        if (message.getRoomId() == null || message.getRoomId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "roomId is required.");
        }
        if (message.getSender() == null || message.getSender().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sender is required.");
        }
        message.setRoomId(message.getRoomId().trim());
        message.setSender(message.getSender().trim());
        message.setType(type);
        message.setTimestamp(LocalDateTime.now());
        if (message.getSenderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "senderId is required.");
        }
        if (message.getContent() == null) {
            message.setContent("");
        }
        if (message.getRole() == null || message.getRole().isBlank()) {
            message.setRole("USER");
        }
        return message;
    }

    private void requireAdmin(HttpSession session) {
        if (!isAdmin(session)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin role is required.");
        }
    }

    private boolean isAdmin(HttpSession session) {
        return session != null
                && "ADMIN".equals(session.getAttribute(LOGIN_USER_ROLE));
    }

    private Long sessionUserId(HttpSession session) {
        if (session == null) {
            return null;
        }
        Object userId = session.getAttribute(LOGIN_USER_ID);
        return userId instanceof Number number ? number.longValue() : null;
    }

    private Long parseRoomUserId(String roomId) {
        try {
            return Long.valueOf(roomId);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "roomId must be a user id.");
        }
    }
}
