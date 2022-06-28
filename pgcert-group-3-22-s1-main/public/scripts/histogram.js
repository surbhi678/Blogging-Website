// src='https://cdn.plot.ly/plotly-2.12.1.min.js'
window.addEventListener("load", async function(){
    const getUserId = document.querySelector("#histogram");
    const dataUserId=getUserId.getAttribute("data-user-id");
    const userId = dataUserId.substring(4,dataUserId.length);
    const output = await getHistogramInfo(userId);

    const ctx = document.getElementById('histogram').getContext('2d');

    const chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: output.rangeOfDate,
        datasets: [{
        label: 'Total number of comments',
        data: output.recordDailyComments,
        backgroundColor: '#5c6bc0',
        }]
    },
    options: {
        scales: {
        xAxes: [{
            display: false,
            barPercentage: 1.5,
            ticks: {
            max: 1,
            }
        }, {
            display: true,
            ticks: {
            autoSkip: false,
            max: 1,
            }
        }],
        yAxes: [{
            ticks: {
            beginAtZero: true
            }
        }]
        }
      
    }
    
    });



});

async function getHistogramInfo(userid) {
    let responseHis = await fetch(`./histogram?userID=${userid}`);
    let output= await responseHis.json();
    return output;
};
