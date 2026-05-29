package com.drawyou.util;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonSyntaxException;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;

public final class JsonUtil {

    private static final Gson GSON = new GsonBuilder()
            .registerTypeAdapter(LocalDateTime.class, new LocalDateTimeAdapter())
            .create();

    private JsonUtil() {
    }

    public static Gson gson() {
        return GSON;
    }

    public static void escreverJson(HttpServletResponse response, int status, Object body) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        try (PrintWriter writer = response.getWriter()) {
            writer.write(GSON.toJson(body));
        }
    }

    public static <T> T lerJson(String json, Class<T> tipo) {
        try {
            return GSON.fromJson(json, tipo);
        } catch (JsonSyntaxException exception) {
            throw new IllegalArgumentException("JSON invalido.", exception);
        }
    }
}
