import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

type SchemaShape = Partial<{
    body: ZodTypeAny;
    query: ZodTypeAny;
    params: ZodTypeAny;
}>;

export const validateRequest = (schema: SchemaShape): RequestHandler => {
    return (req, _res, next) => {
        try {
            req.validated = req.validated ?? {};

            if (schema.body) req.validated.body = schema.body.parse(req.body);
            if (schema.query) req.validated.query = schema.query.parse(req.query);
            if (schema.params) req.validated.params = schema.params.parse(req.params);

            next();
        } catch (err) {
            next(err);
        }
    };
};
