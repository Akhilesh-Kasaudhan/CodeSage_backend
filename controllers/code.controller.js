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

---

### 🔍 Code Review

1. 🐞 **Bugs & Logical Errors** – Point out any functional or runtime issues.
2. 🎯 **Code Quality & Best Practices** – Evaluate readability, structure, naming conventions, and maintainability.
3. 🔐 **Security Issues** – Highlight any potential vulnerabilities and suggest improvements.
4. ⚡ **Performance Optimizations** – Recommend improvements for speed and efficiency.
5. 💡 **Feature Enhancements** – Suggest cleaner, modern, or idiomatic approaches.
6. 🎨 **UI/UX Improvements** – If applicable, offer design, accessibility, and user experience enhancements.
7. 🧪 **Testing Recommendations** – Suggest any test cases or coverage improvements.

---

### 🛠️ Improved Code

Return a fully updated version of the code with your suggestions implemented also separate it from the feedback or review so that the user can copy the code and use it elsewhwere.

---

### 📋 Summary of Changes

Provide a bullet-point list summarizing all key changes and why they were made.

---

Here is the code to review:

\`\`\`${language || ""}
${code}
\`\`\`
`;

    const reviewResult = await generateContent(prompt);

    if (!reviewResult) {
      return next(
        new InternalServerError("Error generating review. Please try again.")
      );
    }

    const newCodeSubmission = new Code({
      userId,
      code,
      language,
      reviewResult,
    });

    await newCodeSubmission.save();

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    const chunks = reviewResult.match(/.{1,100}/g) || [reviewResult];
    for (const chunk of chunks) {
      res.write(chunk);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    res.end();
  } catch (error) {
    return next(
      new InternalServerError("Internal server error during code submission")
    );
  }
};

export const getCodeHistory = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return next(new UnauthorizedError("Unauthorized: userId missing."));
  }
  try {
    const hitoryCount = await Code.countDocuments({ userId });
    const codeHistory = await Code.find({ userId: req.userId }).sort({
      submissionDate: -1,
    });
    if (codeHistory.length === 0) {
      return res.status(404).json({ message: "No code history found." });
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

//deleteCodeHistory of a specific user
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
