import { expect } from "chai";
import express, {NextFunction, Request, Response} from "express";
import supertest from "supertest";

import {requestIdMiddleware} from "../src"

describe("requestIdMiddleware", () => { // the tests container
    it("calls next middleware", async () => { // the single test
        const app = express();
        app.use(requestIdMiddleware);
        const middlewareSpy = new MiddlewareSpy();
        app.use(middlewareSpy.fn());

        await supertest(app).get("/");

        expect(middlewareSpy.hasBeenCalled,"next middleware has been called").to.be.true;
    });

    context ("given request contains x-dv-request-id header", () =>{
        it("req.requestId equals header value", async () => { // the single test
            const app = express();
            app.use(requestIdMiddleware);
            const middlewareSpy = new MiddlewareSpy();
            app.use(middlewareSpy.fn());

            const requestIdFromHeader = "550e8400-e29b-11d4-a716-446655440000";
            await supertest(app).get("/").set("x-dv-request-id","550e8400-e29b-11d4-a716-446655440000");

            expect(middlewareSpy.requestId,"wrong requestId").to.equal(requestIdFromHeader);
        });
    });

    context ("given request doesn't contain x-dv-request-id header", () =>{
        it("req.requestId contains newly generated unique value", async () => { // the single test
            const app = express();
            app.use(requestIdMiddleware);
            const middlewareSpy = new MiddlewareSpy();
            app.use(middlewareSpy.fn());

            await supertest(app).get("/");

            expect(middlewareSpy.requestId,"requestId null or undefined").to.exist;
        });
    })

});

class MiddlewareSpy {
    hasBeenCalled:boolean = false;
    requestId?:string =""
    fn () {
        return (req: Request, res: Response, next: NextFunction) =>{
            this.hasBeenCalled = true;
            this.requestId = req.requestId;
            next();
        }
    }
}