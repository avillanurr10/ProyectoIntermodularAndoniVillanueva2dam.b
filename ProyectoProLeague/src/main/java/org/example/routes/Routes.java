package org.example.routes;

import io.javalin.Javalin;
import org.example.controllers.TeamController;

public class Routes {
    public static void configurar(Javalin app) {
        TeamController teamController = new TeamController();
        app.post("/equipos", teamController::guardarEquipos);
    }
}
