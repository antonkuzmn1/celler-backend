import {prisma} from "./prisma";
import bcrypt from "bcrypt";

export const createRootIfNotExists = async () => {
    const user = await prisma.user.findUnique({
        where: {id: 1, username: 'root'}
    });
    if (!user) {
        const admin = 1;
        const username = 'root';
        const password = await bcrypt.hash('root', 10);
        const name = 'Creator';
        const title = 'Creator account'
        await prisma.user.create({
            // @ts-ignore
            data: {admin, username, password, name, title}
        });
        console.log('Creator user has been initialized');
        return true;
    } else {
        return false;
    }
};
