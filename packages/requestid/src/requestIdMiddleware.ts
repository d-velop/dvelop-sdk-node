import {NextFunction, Request, Response} from 'express';
import {v4 as uuidv4} from "uuid";

const reqIdHeader = "x-dv-request-id";

/**
 * This middleware reads the x-dv-request-id http header from the current request
 * and adds a corresponding requestId property to the Request object.
 *
 * If the request doesn't have an existing id a new unique one is generated.
 *
 * The idea is to read the current id from the received request and pass it
 * to downstream services in order to get a trace across service boundaries.
 *
 * Logstatements should log the requestId in every statement to correlate
 * the statements to a specific request. This simplifies the tracking of
 * a request through a system which serves multiple concurrent requests.
 *
 * @param req represents the HTTP request
 * @param res represents the HTTP response
 * @param next function which, when invoked, executes the middleware succeeding the current middleware
 *
 * @example
 *
 * ```ts
 * import {requestIdMiddleware} from "requestIdMiddleware"
 *
 * const app = express();
 * app.use(requestIdMiddleware);
 *
 * //...
 *
 * app.get("/", function (req, res) {
 *     console.log("received request with id '%s'", req.requestId);
 *     res.send('hello world');
 * })
 * ```
 */
export const requestIdMiddleware = (req:Request, res:Response, next:NextFunction) => {
    req.requestId = req.get(reqIdHeader) || uuidv4();
    next();
}

declare global {
    // Use typescript declaration merging to add an additional property to the original Request interface of
    // express.js
    // cf. https://www.typescriptlang.org/docs/handbook/declaration-merging.html#global-augmentation
    namespace Express {
        export interface Request {
            /**
             * Unique Id for the current request.
             */
            requestId?: string
        }
    }
}


