const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

ctx.strokeStyle = "#00ffd0";
ctx.lineWidth = 3;

ctx.beginPath();
ctx.moveTo(20, 120);
ctx.lineTo(80, 80);
ctx.lineTo(140, 100);
ctx.lineTo(200, 60);
ctx.lineTo(260, 90);
ctx.stroke();