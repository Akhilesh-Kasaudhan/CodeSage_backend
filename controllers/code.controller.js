import Code from "../models/code.model.js";
import { generateContent } from "../lib/geminiService.js";
import {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} from "../utils/error.js";

export const submitCode = async (req, res, next) => {
  const { code, language } = req.body;
  const userId = req.userId;

  if (!userId) {
    return next(new UnauthorizedError("Unauthorized: userId missing."));
  }

  if (!code) {
    return next(new BadRequestError("Please provide code to review."));
  }

  try {
    const prompt = `
You are an expert AI Code Reviewer. Review the following code written in **${
      language || "an unspecified language"
    }** and provide a structured, markdown-formatted response that includes:

### 🔍 Code Review
1. Bugs & Logical Errors  
2. Code Quality  
3. Security Issues  
4. Performance Optimizations  
5. Feature Enhancements  
6. UI/UX Improvements (if applicable)  
7. Testing Recommendations  

### 🛠️ Improved Code
Provide a clean, updated version of the code.

### 📋 Summary of Changes
Provide a list summarizing improvements.

Here is the code:
\`\`\`${language || ""}
${code}
\`\`\`
`;

    // ---------- FIX: handle new generateContent response format ----------
    const aiResponse = await generateContent(prompt);

    if (!aiResponse.success) {
      console.error("Gemini Generation Error:", aiResponse.error);

      return next(
        new InternalServerError(
          aiResponse.error || "Error generating code review."
        )
      );
    }

    const reviewText = aiResponse.data;

    // ---------- Save to DB ----------
    const newCodeSubmission = new Code({
      userId,
      code,
      language,
      reviewResult: reviewText,
    });

    await newCodeSubmission.save();

    // ---------- Streaming Response ----------
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const chunks = reviewText.match(/.{1,150}/g) || [reviewText];

    for (const chunk of chunks) {
      res.write(chunk);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    res.end();
  } catch (error) {
    console.error("Error during submitCode:", error);

    return next(
      new InternalServerError("Internal server error during code submission.")
    );
  }
};

export const getCodeHistory = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return next(new UnauthorizedError("Unauthorized: userId missing."));
  }
  try {
    const codeHistory = await Code.find({ userId: req.userId }).sort({
      submissionDate: -1,
    });
    if (codeHistory.length === 0) {
      return res
        .status(200)
        .json({ message: "No code history found.", codeHistory: [] });
    }
    res
      .status(200)
      .json({ message: "Code history retrieved successfully.", codeHistory });
  } catch (error) {
    return next(
      new InternalServerError(
        "Internal server error while fetching code history"
      )
    );
  }
};

export const deleteCodeHistory = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return next(new UnauthorizedError("Unauthorized: userId missing."));
  }
  try {
    const { codeId } = req.params;
    const deletedCode = await Code.findOneAndDelete({
      _id: codeId,
      userId: req.userId,
    });
    if (!deletedCode) {
      return res.status(404).json({ message: "Code not found." });
    }
    res.status(200).json({ message: "Code deleted successfully." });
  } catch (error) {
    return next(
      new InternalServerError("Internal server error while deleting code")
    );
  }
};
export const deleteAllCodeHistory = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return next(new UnauthorizedError("Unauthorized: userId missing."));
  }
  try {
    await Code.deleteMany({ userId: req.userId });
    res.status(200).json({ message: "All code history deleted successfully." });
  } catch (error) {
    return next(
      new InternalServerError(
        "Internal server error while deleting all code history"
      )
    );
  }
};

export const deleteCodeHistoryOfUser = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return next(new UnauthorizedError("Unauthorized: userId missing."));
  }
  try {
    const deleteCode = await Code.deleteMany({ userId: req.userId });
    if (!deleteCode) {
      return res.status(404).json({ message: "Code not found." });
    }
    res.status(200).json({ message: "Code deleted successfully." });
  } catch (error) {
    return next(
      new InternalServerError("Internal server error while deleting code")
    );
  }
};
