"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { marked } from "marked";
import styles from "./components.module.css";

type PostData = {
  title: string;
  description: string;
  content: string;
  tags: string;
  imageUrl: string;
  category: string;
};

interface PostFormProps {
  initialData?: PostData;
  onSubmit?: (data: PostData) => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function PostForm({ initialData, onSubmit, isSubmitting = false }: PostFormProps) {
  const router = useRouter();
  // Prevent hydration mismatch when initialData changes after mount
  const [isMounted, setIsMounted] = useState(false);
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  // Set initial form values: use existing data if editing, otherwise use empty strings.
  const [formData, setFormData] = useState<PostData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    tags: initialData?.tags || "",
    imageUrl: initialData?.imageUrl || "",
    category: initialData?.category || "",
  });

  // States for errors, markdown preview, and cursor tracking.
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPos, setCursorPos] = useState({ start: 0, end: 0 });

  // Ref to always hold the latest form data for callbacks.
  const formDataRef = useRef<PostData>(formData);

  // Mark as mounted on the client.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if post data has changed.
  const isSamePostData = (a: PostData, b: PostData) => {
    return (
      a.title === b.title &&
      a.description === b.description &&
      a.content === b.content &&
      a.tags === b.tags &&
      a.imageUrl === b.imageUrl &&
      a.category === b.category
    );
  };

  // Sync form state if the parent component updates initialData.
  useEffect(() => {
    if (initialData) {
      const newData: PostData = {
        title: initialData.title || "",
        description: initialData.description || "",
        content: initialData.content || "",
        tags: initialData.tags || "",
        imageUrl: initialData.imageUrl || "",
        category: initialData.category || "",
      };
      if (isSamePostData(formDataRef.current, newData)) return;
      formDataRef.current = newData;
      setFormData(newData);
      setErrors({});
    }
  }, [initialData]);
  // Update a specific field in the form state.
  const updateField = (field: keyof PostData, value: string) => {
    const newData = { ...formDataRef.current, [field]: value };
    formDataRef.current = newData;
    setFormData(newData);
  };

  // Validate input fields before submitting.
  const validate = (data: PostData = formDataRef.current) => {
    const newErrors: Record<string, string> = {};
    if (!data.title.trim()) newErrors.title = "Title is required";
    if (!data.description.trim()) newErrors.description = "Description is required";
    if (data.description.length > 200) newErrors.description = "Description is too long. Maximum is 200 characters";
    if (!data.content.trim()) newErrors.content = "Content is required";
    if (!data.tags.trim()) newErrors.tags = "At least one tag is required";
    if (!data.category.trim()) newErrors.category = "Category is required";
    if (!data.imageUrl.trim()) {
      newErrors.imageUrl = "Image URL is required";
    } else {
      try {
        new URL(data.imageUrl);
      } catch {
        newErrors.imageUrl = "This is not a valid URL";
      }
    }

    setErrors(newErrors);
    // Return true if there are no errors, else false.
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission and pass data to the parent.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formEl = e.currentTarget;
    // get the latest values directly from the web page. If it fails, use backup data.
    const currentData: PostData = {
      title:
        (formEl.querySelector("#post-title") as HTMLInputElement | null)
          ?.value ?? formDataRef.current.title,
      description:
        (formEl.querySelector("#post-desc") as HTMLTextAreaElement | null)
          ?.value ?? formDataRef.current.description,
      content:
        (formEl.querySelector("#post-content") as HTMLTextAreaElement | null)
          ?.value ?? formDataRef.current.content,
      tags:
        (formEl.querySelector("#post-tags") as HTMLInputElement | null)
          ?.value ?? formDataRef.current.tags,
      imageUrl:
        (formEl.querySelector("#post-image") as HTMLInputElement | null)
          ?.value ?? formDataRef.current.imageUrl,
      category:
        (formEl.querySelector("#post-category") as HTMLInputElement | null)
          ?.value ?? formDataRef.current.category,
    };

    formDataRef.current = currentData;
    setFormData(currentData);

    if (validate(currentData)) {
      if (onSubmit) {
    setInternalSubmitting(true);
        setSuccessMessage("Post updated successfully");
    try {
      await onSubmit(currentData);
          // Wait 3 seconds to show the success message, then navigate
          await new Promise(resolve => setTimeout(resolve, 3000));
          router.push("/");
    } catch (error) {
      setSuccessMessage("");
      setInternalSubmitting(false);
          throw error;
        }
      }
    }
  };

  // Switch between edit mode and markdown preview, saving cursor position.
  const togglePreview = () => {
    if (!showPreview && contentTextareaRef.current) {
      setCursorPos({
        start: contentTextareaRef.current.selectionStart,
        end: contentTextareaRef.current.selectionEnd,
      });
    }
    setShowPreview(!showPreview);
  };

  // Restore cursor position when returning to edit mode.
  useEffect(() => {
    if (!showPreview && contentTextareaRef.current) {
      contentTextareaRef.current.setSelectionRange(cursorPos.start, cursorPos.end);
      contentTextareaRef.current.focus();
    }
  }, [showPreview, cursorPos]);
  
  // Convert markdown text to HTML securely. showPreview, cursorPos
  const getPreviewHtml = () => {
    try {
      const result = marked.parse(formData.content || "");
      return typeof result === "string" ? result : `<p>Loading preview...</p>`;
    } catch {
      return `<p>Error parsing markdown</p>`;
    }
  };



  // Prevent mismatch: Wait for browser to load before rendering the form
  if (!isMounted) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className={`${styles.flexColGap6} ${styles.card}`} style={{ maxWidth: '42rem', width: '100%' }}>
      {/* Title */}
      <div>
        <label htmlFor="post-title" className={styles.label}>Title</label>
        <input
          id="post-title"
          type="text"
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
          className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
        />
        {errors.title && <p className={styles.errorText}>{errors.title}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="post-category" className={styles.label}>Category</label>
        <input
          id="post-category"
          type="text"
          value={formData.category}
          onChange={(e) => updateField("category", e.target.value)}
          className={`${styles.input} ${errors.category ? styles.inputError : ""}`}
        />
        {errors.category && <p className={styles.errorText}>{errors.category}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="post-desc" className={styles.label}>Description</label>
        <textarea
          id="post-desc"
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
          className={`${styles.input} ${errors.description ? styles.inputError : ""}`}
        />
        <div className={styles.flexBetween} style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
          <span className={formData.description.length > 200 ? styles.errorText : styles.textGray}>
            {formData.description.length} / 200
          </span>
          {errors.description && <span className={styles.errorText}>{errors.description}</span>}
        </div>
      </div>

      {/* Content */}
      <div>
        <div className={styles.flexBetween} style={{ marginBottom: '0.25rem' }}>
          <label htmlFor="post-content" className={styles.label} style={{ marginBottom: 0 }}>Content</label>
          <button
            type="button"
            onClick={togglePreview}
            className={styles.buttonSecondary}
          >
            {showPreview ? "Close Preview" : "Preview"}
          </button>
        </div>
        
        {showPreview ? (
          <div 
            data-test-id="content-preview"
            className={styles.previewBox}
            dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
          />
        ) : (
          <textarea
            id="post-content"
            ref={contentTextareaRef}
            value={formData.content}
            onChange={(e) => updateField("content", e.target.value)}
            rows={8}
            className={`${styles.input} ${styles.fontMono} ${errors.content ? styles.inputError : ""}`}
          />
        )}
        {errors.content && <p className={styles.errorText}>{errors.content}</p>}
      </div>

      {/* Tag List */}
      <div>
        <label htmlFor="post-tags" className={styles.label}>Tags</label>
        <input
          id="post-tags"
          type="text"
          value={formData.tags}
          onChange={(e) => updateField("tags", e.target.value)}
          placeholder="e.g., React, NextJS, Tutorial"
          className={`${styles.input} ${errors.tags ? styles.inputError : ""}`}
        />
        {errors.tags && <p className={styles.errorText}>{errors.tags}</p>}
      </div>

      {/* Image URL */}
      <div>
        <label htmlFor="post-image" className={styles.label}>Image URL</label>
        <input
          id="post-image"
          type="text"
          value={formData.imageUrl}
          onChange={(e) => updateField("imageUrl", e.target.value)}
          placeholder="https://..."
          className={`${styles.input} ${errors.imageUrl ? styles.inputError : ""}`}
        />
        {errors.imageUrl && <p className={styles.errorText}>{errors.imageUrl}</p>}
        {/* Image Preview */}
        {formData.imageUrl && (
          <div className={styles.imageContainer} style={{ marginTop: '1rem', height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              data-test-id="image-preview"
              src={formData.imageUrl} 
              alt="Post Thumbnail" 
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <div className={styles.flexEnd}>
        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.buttonPrimary}
        >
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </div>
      
      {successMessage && (
        <div className={styles.successBox} role="alert">
          {successMessage}
        </div>
      )}
      
      {Object.keys(errors).length > 0 && (
        <div className={styles.errorBox}>
          Please fix the errors before saving.
        </div>
      )}
    </form>
  );
}