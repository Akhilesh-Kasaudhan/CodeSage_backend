import Code from "../models/code.model.js";
import { generateContent } from "../lib/geminiService.js";

export const submitCode = async (req, res, next) => {
  const { code, language } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ message: "Unauthorized: userId missing." });
  }

  if (!code) {
    return res.status(400).json({ message: "Please provide code to review." });
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
      return res
        .status(500)
        .json({ message: "Error generating review. Please try again." });
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
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// export const getCodeHistory = async (req, res) => {
//   const userId = req.userId;
//   if (!userId) {
//     return res.status(400).json({ message: "Unauthorized: userId missing." });
//   }
//   try {
//     const codeHistory = await Code.find({ userId: req.userId }).sort({
//       submissionDate: -1,
//     });
//     if (codeHistory.length === 0) {
//       return res.status(404).json({ message: "No code history found." });
//       // return next(new BadRequestError("No code history found.")); // Changed to BadRequestError
//     }
//     res
//       .status(200)
//       .json({ message: "Code history retrieved successfully.", codeHistory });
//   } catch (error) {
//     // return next(new InternalServerError("Internal server error"));
//     res.status(500).json({
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

export const getCodeHistory = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(400).json({ message: "Unauthorized: userId missing." });
  }
  try {
    const codeHistory = await Code.find({ userId: req.userId }).sort({
      submissionDate: -1,
    });
    if (codeHistory.length === 0) {
      return res.status(404).json({ message: "No code history found." });
      // return next(new BadRequestError("No code history found.")); // Changed to BadRequestError
    }
    res
      .status(200)
      .json({ message: "Code history retrieved successfully.", codeHistory });
  } catch (error) {
    // return next(new InternalServerError("Internal server error"));
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
