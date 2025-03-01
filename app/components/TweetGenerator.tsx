import { ChangeEvent, useState } from 'react';
import { useChat } from 'ai/react';
import Tweet from './Tweet';
import styles from './tweetgenerator.module.css';

const TweetGenerator = () => {
  const [tweetText, setTweetText] = useState('');
  const [tone, setTone] = useState('funny');
  const [imageUrl, setImageUrl] = useState("");
  const [generateImage, setGenerateImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedTweet, setGeneratedTweet] = useState('');
  const [disableSubmitButton, setDisableSubmitButton] = useState(true);
  const [generationCount, setGenerationCount] = useState(0);
  const [generationHistory, setGenerationHistory] = useState<Array<{
    prompt: string,
    result: string,
    timestamp: Date
  }>>([]);

  const { handleInputChange, handleSubmit } = useChat({
    api: '/api/gpt',
    onFinish: (message) => {
      setError('');
      setGenerationCount(prevCount => prevCount + 1);

      let generatedTweetContent = message.content;
      // Remove hashtags from the generated tweet
      generatedTweetContent = generatedTweetContent?.replace(/#[\w]+/g, '');
      setGeneratedTweet(generatedTweetContent);
      
      // Add this new section to store the generation in history
      setGenerationHistory(prevHistory => [...prevHistory, {
        prompt: tweetText,
        result: generatedTweetContent,
        timestamp: new Date()
      }]);
      
      if (generateImage && generatedTweetContent) {
        getImageData(generatedTweetContent).then();
      } else {
        setLoading(false);
      }
    },
    onError: (error) => {
      setError(`An error occurred calling the OpenAI API: ${error}`);
      setLoading(false);
    }
  });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    handleSubmit(event);
    setDisableSubmitButton(true);
  };

  const getImageData = async (prompt: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/dall-e', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      });
      const { imageUrl } = await response.json();
      setImageUrl(imageUrl);
      setError('');
    } catch (error) {
      setError(`An error occurred calling the Dall-E API: ${error}`);
    }
    setLoading(false);
  };


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Generate your next Motivational Tweet using AI</h1>
        <p>Tweets generated: {generationCount}</p>
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <label htmlFor="bioInput" className={styles.label}>1. Write the topic you want to tweet about.</label>
        <textarea
          id="bioInput"
          className={styles.textarea}
          rows={4}
          placeholder="An announcement for our new product: Gen Z Translator"
          value={tweetText}
          onChange={(e) => {
            setTweetText(e.target.value);
            handleInputChange({
              ...e,
              target: {
                ...e.target,
                value: `Generate a ${tone} post about ${e.target.value}`
              }
            });
            setDisableSubmitButton(false);
          }}
          disabled={loading}
        />

        <label htmlFor="vibeSelect" className={styles.label}>2. Select your style.</label>
        <select
          id="vibeSelect"
          className={styles.select}
          onChange={(e) => {
            const event = e as unknown as ChangeEvent<HTMLInputElement>;
            setTone(event.target.value);
            handleInputChange({
              ...event,
              target: {
                ...event.target,
                value: `Generate a ${e.target.value} post about ${tweetText}.`
              }
            });
            setDisableSubmitButton(false);
          }}
          disabled={loading}
        >
          <option value="funny">Funny</option>
          <option value="inspirational">Inspirational</option>
          <option value="casual">Casual</option>
        </select>

        <div className={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="imageOption"
            className={styles.checkbox}
            checked={generateImage}
            onChange={(e) => setGenerateImage(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor="imageOption" className={styles.checkboxLabel}>Generate an image with the tweet</label>
        </div>

        <button className={styles.button} type="submit" disabled={disableSubmitButton}>
          Generate your tweet →
        </button>
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {generatedTweet && <Tweet tweet={generatedTweet} imageSrc={imageUrl} />}
      
      {generationHistory.length > 0 && (
        <div className={styles.historySection}>
          <h2>Generation History</h2>
          {generationHistory.map((entry, index) => (
            <div key={index} className={styles.historyItem}>
              <p><strong>Prompt:</strong> {entry.prompt}</p>
              <p><strong>Result:</strong> {entry.result}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TweetGenerator;