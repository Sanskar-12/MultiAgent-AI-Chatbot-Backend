import axios from "axios";

export const deductCredits = async (userId, agent) => {
  try {
    const { data } = await axios.put(
      `${process.env.AUTH_SERVICE}/deduct-credits`,
      {
        userId,
        agent,
      },
    );

    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
