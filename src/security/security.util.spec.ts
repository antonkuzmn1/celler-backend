// import {generateToken, getDataFromToken} from "./security.util";
//
// describe('security.util.ts', () => {
//     beforeEach(() => {
//         jest.resetAllMocks();
//     })
//
//
//
//     test('generateToken - User not found', async () => {
//         const username = 'root1';
//         const password = 'root';
//         const tokenResponse = await generateToken(username, password);
//         expect(tokenResponse.success).toEqual(false);
//         expect(tokenResponse.message).toEqual('User not found');
//     });
//
//     test('generateToken - Incorrect password', async () => {
//         const username = 'root';
//         const password = 'root1';
//         const tokenResponse = await generateToken(username, password);
//         expect(tokenResponse.success).toEqual(false);
//         expect(tokenResponse.message).toEqual('Incorrect password');
//     });
//
//     test('generateToken - Success', async () => {
//         const username = 'root';
//         const password = 'root';
//         const tokenResponse = await generateToken(username, password);
//         expect(tokenResponse.success).toEqual(true);
//     });
//
//     test('getDataFromToken - Token is undefined', async () => {
//         const token = 'token13'
//         const tokenResponse = await getDataFromToken(token);
//         expect(tokenResponse.success).toEqual(false);
//         expect(tokenResponse.message).toEqual('Token is undefined');
//     });
//
//     test('getDataFromToken - Success', async () => {
//         const username = 'root';
//         const password = 'root';
//         const token = await generateToken(username, password);
//         const tokenResponse = await getDataFromToken(token.message);
//         expect(tokenResponse.success).toEqual(true);
//         expect(tokenResponse.message).toEqual(1);
//     });
// });
