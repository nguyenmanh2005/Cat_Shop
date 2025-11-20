import axios from 'axios';

// Sử dụng MyMemory Translation API (MIỄN PHÍ, không cần API key)
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// Translation service - gọi trực tiếp MyMemory API (hoàn toàn miễn phí)
export const translationService = {
  /**
   * Dịch văn bản với auto-detect ngôn ngữ nguồn
   */
  async translateAuto(text: string, targetLang: string): Promise<string> {
    if (!text || text.length > 500) {
      return text; // MyMemory giới hạn 500 ký tự mỗi request
    }

    try {
      const response = await axios.get(MYMEMORY_API_URL, {
        params: {
          q: text,
          langpair: `auto|${targetLang}`
        }
      });

      const translatedText = response.data?.responseData?.translatedText;
      return translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  },

  /**
   * Dịch văn bản từ ngôn ngữ nguồn cụ thể
   */
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!text || text.length > 500) {
      return text; // MyMemory giới hạn 500 ký tự mỗi request
    }

    try {
      const response = await axios.get(MYMEMORY_API_URL, {
        params: {
          q: text,
          langpair: `${sourceLang}|${targetLang}`
        }
      });

      const translatedText = response.data?.responseData?.translatedText;
      return translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Fallback to original text
    }
  },

  /**
   * Detect ngôn ngữ của text (fallback về 'vi' vì MyMemory không có detect API)
   */
  async detectLanguage(text: string): Promise<string> {
    // MyMemory không có API detect, return default
    return 'vi';
  }
};
