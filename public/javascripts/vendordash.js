
        // dashboard  
        $("#bar").click(function () {
            $(this).toggleClass("open");
            $("#page-content-wrapper ,#sidebar-wrapper").toggleClass("toggled");
        });
        //
         function toggleMenu() {
        let navigation = document.querySelector(".navigation");
        let toggle = document.querySelector(".toggle");

        navigation.classList.toggle("active");
        toggle.classList.toggle("active");
      }

      let labels1 = ["PRO1", "PRO2"];
      let data1 = [69, 31];
      let color1 = ["#49A9EA", "#36CAAB"];

      let mychart1 = document.getElementById("myChart1").getContext("2d");
      let chart1 = new Chart(mychart1, {
        type: "doughnut",
        data: {
          labels: labels1,
          datasets: [
            {
              data: data1,
              backgroundColor: color1,
            },
          ],
        },
        options: {
          // title:{
          //     text:"do you like ",
          //     fontColor: 'black',
          //     display:true
          // },
          legend: {
            labels: {
              fontColor: "black",
              fontNumber: 30,
            },
          },
        },
      });

      let labels2 = ["THIS MONTH", "LAST MONTH"];
      let data2 = [69, 31];
      let color2 = ["#49A9EA", "#36CAAB"];

      let mychart2 = document.getElementById("myChart2").getContext("2d");
      let chart2 = new Chart(mychart2, {
        type: "pie",
        data: {
          labels: labels2,
          datasets: [
            {
              data: data2,
              backgroundColor: color2,
            },
          ],
        },
        options: {
          // title:{
          //     text:"do you like ",
          //     fontColor: 'black',
          //     display:true
          // },
          legend: {
            labels: {
              fontColor: "black",
              fontNumber: 30,
            },
          },
        },
      });
    