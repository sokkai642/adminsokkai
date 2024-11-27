import History from "../../../Model/customerdata";
import connectMongoDB from "@/app/api/Connection";
export async function POST(request) {
  await connectMongoDB();
  const { userid, productid } = await request.json();

  if (!userid || !productid) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  try {
    const history = await History.findOneAndUpdate(
      { userid },
      { $push: { products: productid } }, 
      { upsert: true, new: true }
    );
    return new Response(JSON.stringify(history), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
