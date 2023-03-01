import { randomUUID } from "node:crypto";
import { Database } from "./database.js";
import { buildRoutepath } from "./utils/build-router-paths.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutepath("/task"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select("tasks", {
        title: search,
        description: search,
      });

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutepath("/task"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "title is required." }));
      }

      if (!description) {
        return res
          .writeHead(400)
          .end(JSON.stringify({ message: "description is required." }));
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      database.insert("tasks", task);

      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutepath("/task/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title || !description) {
        return res
          .writeHead(400)
          .end(
            JSON.stringify({ message: "title or description are required." })
          );
      }

      const [task] = database.select("tasks", { id });

      if (!task) {
        return res.writeHead(404).end();
      }

      database.update(
        "tasks",
        {
          title,
          description,
          updated_at: new Date(),
        },
        id
      );

      return res.writeHead(204).end();
    },
  },
  {
    method: "DELETE",
    path: buildRoutepath("/task/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select("tasks", { id });

      if (!task) {
        return res.writeHead(404).end();
      }

      database.delete("tasks", id);

      return res.writeHead(204).end();
    },
  },
  {
    method: "PATCH",
    path: buildRoutepath("/task/:id/completed"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select("tasks", { id });

      if (!task) {
        return res.writeHead(404).end();
      }

      const isTaskCompleted = !!task.completed_at;
      const completed_at = isTaskCompleted ? null : new Date();

      database.update("tasks", { completed_at }, id);

      return res.writeHead(204).end();
    },
  },
];
