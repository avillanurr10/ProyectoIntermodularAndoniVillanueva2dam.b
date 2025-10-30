package org.example;

import io.javalin.Javalin;
import org.example.routes.Routes;

public class Main {
    public static void main(String[] args) {
        // Forma correcta para Javalin 5
        Javalin app = Javalin.create(config -> {
            config.defaultContentType("application/json");
        }).start(7000);

        Routes.configurar(app);
        System.out.println("Servidor iniciado en http://localhost:7000");
    }
}
