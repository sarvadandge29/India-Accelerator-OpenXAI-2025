"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("neutral");
  const [words, setWords] = useState(300);
  const [audience, setAudience] = useState("general");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setOutput("");
    setLoading(true);

    const response = await fetch("/api/article", {
      method: "POST",
      body: JSON.stringify({ topic, words, tone, audience }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        setOutput((prev) => prev + decoder.decode(value));
      }
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex flex-col items-center p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">AI Article Generator</h1>

      <Card className="w-full max-w-xl bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Article Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="topic" className="text-gray-300">Topic</Label>
            <Input
              id="topic"
              placeholder="Enter a topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-gray-800 text-white border-gray-700"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="words" className="text-gray-300">Words</Label>
              <Input
                id="words"
                type="number"
                value={words}
                onChange={(e) => setWords(Number(e.target.value))}
                className="bg-gray-800 text-white border-gray-700"
              />
            </div>

            <div className="flex-1">
              <Label className="text-gray-300">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-gray-700">
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="upbeat">Upbeat</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label htmlFor="audience" className="text-gray-300">Audience</Label>
              <Input
                id="audience"
                placeholder="e.g. general, students..."
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="bg-gray-800 text-white border-gray-700"
              />
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Generating..." : "Generate"}
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-2">Generated Article</h2>
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-4 min-h-[200px] whitespace-pre-wrap text-gray-100">
            {output || "Your article will appear here..."}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
