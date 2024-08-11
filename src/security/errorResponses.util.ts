import {Response} from "express";

/*
 * 400 - Invalid Request
 *
 * 401 - Authentication Required
 *
 * 403 - Access Denied
 *
 * 404 - Not Found
 *
 * 500 - Internal Server Error
 */
export const errorResponse = (res: Response, code: 400 | 401 | 403 | 404 | 500) => {
    switch (code) {
        case 400:
            return res.status(400).json('Invalid Request');
        case 401:
            return res.status(401).json('Authentication Required');
        case 403:
            return res.status(403).json('Access Denied');
        case 404:
            return res.status(404).json('Not Found');
        default:
            return res.status(500).json('Internal Server Error');
    }
}
