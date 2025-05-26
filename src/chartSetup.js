// src/chartSetup.js
import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
  } from 'chart.js';
  
  Chart.register(
    CategoryScale,   // саме ця лінійка вирішує помилку "category is not a registered scale"
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
  );
  