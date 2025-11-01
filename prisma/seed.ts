import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient()
async function main() {
    const user1 = await prisma.user.create({
        data: {
            email: "kyynotseph@gmail.com",
            password: "$2b$10$ZoQ1ZiY4fTS7Pyc4J4Y0B.TpED0dlWsjMRptobcdOLAqHchR8rTBO",
            profile: {
                create: {
                    userName: "fiky"
                }
            }
        }
    })

    const user2 = await prisma.user.create({
        data: {
            email: "yoruzae0404@gmail.com",
            password: "$2b$10$ZoQ1ZiY4fTS7Pyc4J4Y0B.TpED0dlWsjMRptobcdOLAqHchR8rTBO",
            profile: {
                create: {
                    userName: "yoruzae"
                }
            }
        }
    })

    const user3 = await prisma.user.create({
        data: {
            email: "kyynihboss@gmail.com",
            password: "$2b$10$ZoQ1ZiY4fTS7Pyc4J4Y0B.TpED0dlWsjMRptobcdOLAqHchR8rTBO",
            profile: {
                create: {
                    userName: "Kurumi"
                }
            }
        }
    })

    const user4 = await prisma.user.create({
        data: {
            email: "dedimulyadi@gmail.com",
            password: "$2b$10$ZoQ1ZiY4fTS7Pyc4J4Y0B.TpED0dlWsjMRptobcdOLAqHchR8rTBO",
            profile: {
                create: {
                    userName: "Dedi Mulyadi"
                }
            }
        }
    })
    console.log(user1, user2, user3, user4)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    }).catch(async (err) => {
        console.error(err)
        await prisma.$disconnect()
        process.exit(1)
    })