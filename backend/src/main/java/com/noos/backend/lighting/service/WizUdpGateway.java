package com.noos.backend.lighting.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

class WizUdpGateway {

    private static final int WIZ_PORT = 38899;
    private static final int WRITE_RETRY_COUNT = 2;
    private static final int WRITE_RETRY_DELAY_MS = 35;
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;
    private final int commandTimeoutMs;

    WizUdpGateway(ObjectMapper objectMapper, int commandTimeoutMs) {
        this.objectMapper = objectMapper;
        this.commandTimeoutMs = commandTimeoutMs;
    }

    Map<String, Object> sendWriteCommand(String ip, Map<String, Object> payload) {
        IOException lastError = null;
        for (int attempt = 1; attempt <= WRITE_RETRY_COUNT; attempt += 1) {
            try (DatagramSocket socket = new DatagramSocket()) {
                byte[] data = objectMapper.writeValueAsBytes(payload);
                DatagramPacket packet = new DatagramPacket(data, data.length, InetAddress.getByName(ip), WIZ_PORT);
                socket.send(packet);
                return Map.of("sourceIp", ip, "sent", true, "attempt", attempt);
            } catch (IOException error) {
                lastError = error;
                if (attempt < WRITE_RETRY_COUNT) {
                    sleepInterruptibly(WRITE_RETRY_DELAY_MS);
                }
            }
        }
        throw new ResponseStatusException(SERVICE_UNAVAILABLE, "WiZ UDP write failed: " + ip, lastError);
    }

    Map<String, Object> sendReadCommand(String ip, Map<String, Object> payload) {
        try (DatagramSocket socket = new DatagramSocket()) {
            socket.setSoTimeout(commandTimeoutMs);
            byte[] data = objectMapper.writeValueAsBytes(payload);
            DatagramPacket packet = new DatagramPacket(data, data.length, InetAddress.getByName(ip), WIZ_PORT);
            socket.send(packet);

            byte[] buffer = new byte[8192];
            DatagramPacket response = new DatagramPacket(buffer, buffer.length);
            socket.receive(response);
            String responseText = new String(response.getData(), response.getOffset(), response.getLength(), StandardCharsets.UTF_8);
            Map<String, Object> parsed = objectMapper.readValue(responseText, MAP_TYPE);
            parsed.put("sourceIp", response.getAddress().getHostAddress());
            return parsed;
        } catch (SocketTimeoutException error) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "WiZ bulb timed out: " + ip, error);
        } catch (IOException error) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "WiZ UDP command failed: " + ip, error);
        }
    }

    private void sleepInterruptibly(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
        }
    }
}
