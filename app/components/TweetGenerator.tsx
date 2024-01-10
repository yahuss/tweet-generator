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
  console.log('disableSubmitButton:', disableSubmitButton);

  const { handleInputChange, handleSubmit } = useChat({
    api: '/api/gpt',
    onFinish: (message) => {
      setError('');

      const generatedTweetContent = message.content;
      setGeneratedTweet(generatedTweetContent);
      
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
        <h1>Generate your next Tweet using AI</h1>
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <label htmlFor="bioInput" className={styles.label}>1. Write the topic you want to tweet about.</label>
        <textarea
          id="bioInput"
          className={styles.textarea}
          rows={4}
          placeholder="An announcement for our new product: Leetcode Torture"
          value={tweetText}
          onChange={(e) => {
            setTweetText(e.target.value)
            handleInputChange({
              ...e,
              target: {
                ...e.target,
                value: `Generate a ${tone} tweet about ${e.target.value}.`}
              }
            );
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
                value: `Generate a ${e.target.value} tweet about ${tweetText}.`
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
    </div>
  );
}

export default TweetGenerator;