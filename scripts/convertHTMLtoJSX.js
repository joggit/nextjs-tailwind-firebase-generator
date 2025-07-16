import fs from 'fs';
import path from 'path';

const htmlToJsx = (htmlContent) => {
  return htmlContent
    .replace(/class=/g, 'className=') // Replace class with className
    .replace(/for=/g, 'htmlFor=') // Replace for with htmlFor
    .replace(/fill-rule=/g, 'fillRule=') // Convert fill-rule
    .replace(/clip-rule=/g, 'clipRule=') // Convert clip-rule
    .replace(/stroke-linecap=/g, 'strokeLinecap=') // Convert stroke-linecap
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=') // Convert stroke-linejoin
    .replace(/stroke-width=/g, 'strokeWidth=') // Convert stroke-width
    .replace(/tabindex=/g, 'tabIndex=') // Convert tabindex
    .replace(/readonly/g, 'readOnly') // Convert readonly
    .replace(/xlink:href=/g, 'href=') // Replace xlink:href with href
    .replace(/xmlns:xlink=".*?"/g, '') // Remove xmlns:xlink attributes
    .replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}') // Convert HTML comments to JSX comments
    .replace(/<(input|img|br|hr|area|base|col|embed|source|track|wbr)([^>]*)>/g, '<$1$2/>') // Properly self-close void elements
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/g, '') // Remove <style> blocks
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/g, ''); // Remove <script> blocks
};




const convertFile = async (inputFilePath, outputFilePath) => {
  try {
    const htmlContent = await fs.promises.readFile(inputFilePath, 'utf-8');
    const jsxContent = htmlToJsx(htmlContent);
    await fs.promises.writeFile(outputFilePath, jsxContent, 'utf-8');
    console.log(`HTML successfully converted to JSX and saved to ${outputFilePath}`);
  } catch (error) {
    console.error('Error processing the file:', error);
  }
};

// Define input and output paths
const __dirname = path.resolve();
const inputFile = path.join(__dirname, 'input.html'); // Replace with the path to your HTML file
const outputFile = path.join(__dirname, 'output.jsx'); // Replace with the desired JSX output path

convertFile(inputFile, outputFile);
