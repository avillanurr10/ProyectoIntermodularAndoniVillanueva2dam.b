package org.example.controllers;

import io.javalin.http.Context;
import org.example.services.TeamService;
import org.example.models.Team;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

public class TeamController {

    private final TeamService service = new TeamService();

    // Endpoint para recibir JSON y guardar en BD
    public void guardarEquipos(Context ctx) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        List<Team> equipos = mapper.readValue(
                ctx.body(),
                mapper.getTypeFactory().constructCollectionType(List.class, Team.class)
        );
        service.guardarEquiposEnBD(equipos);
        ctx.status(201).result("Equipos guardados correctamente");
    }
}
