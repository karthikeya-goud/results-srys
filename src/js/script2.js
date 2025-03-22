
function sliderChanged(ele){
    if(ele.value==="100"){
        document.getElementById("jntuh-marks").style.display="none"
        document.getElementById("analytics").style.display="block"
        select_sem_analytics(document.getElementById("year-analytics"))
    }else{
        document.getElementById("jntuh-marks").style.display="block"
        document.getElementById("analytics").style.display="none"
    }
}

function makeupper(ele){
    let v = ele.value;
      ele.value = v.toUpperCase();
      if(ele.value.length!=10){
        document.getElementById("select-year").style.display="none";
        document.getElementById("student-info").style.display="none";
        document.getElementById("results").style.display="none";
      }
      document.getElementById("changegpa-section").style.display="none";
}


function check_rollno(rollno){
    const regex = /^(20|21|22)VE(1|5)A66[a-zA-Z0-9][0-9]$/;
    return regex.test(rollno);
}
function rollno_submit(){
    let rollno=document.getElementById("rollno");
    let roll=rollno.value.trim()
    if(check_rollno(roll)){
        document.getElementById("input-rollno-error").textContent="";
        if(roll in student_details){
          document.getElementById("select-year").style.display="block";
          display_details()
          select_sem(document.getElementById("year"))
        }
        else{
          document.getElementById("input-rollno-error").textContent="Roll number is not available";
          document.getElementById("student-info").style.display="none";
          document.getElementById("results").style.display="none";
          document.getElementById("changegpa-section").style.display="none"
        }
        
    }else{
        rollno.value="";
        document.getElementById("student-info").style.display="none";
        document.getElementById("input-rollno-error").textContent="Enter roll number correctly";
        document.getElementById("results").style.display="none";
        document.getElementById("changegpa-section").style.display="none";
    }
}



function display_details(){
    document.getElementById("student-info").style.display="block";
    const id=document.getElementById("rollno").value.trim()
    const data=student_details[id]
    const tableBody = document.getElementById('studentinfoBody');
    tableBody.innerHTML="";
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${id}</td>
        <td>${data.name}</td>
      `;
    tableBody.appendChild(row);
    document.getElementById("cgpa").textContent=parseFloat(data["cgpa"]).toFixed(4)
    show_linechart(id)
}

function select_sem(ele){
    let sem=ele.value;
    let id=document.getElementById("rollno").value.trim()
    if(id.startsWith("22") && (sem==="sem1" || sem==="sem2")){
        document.getElementById("results").style.display="none";
        document.getElementById("les").textContent="You guys did diploma right"
    }
    else{
        document.getElementById("les").textContent=""
        let data=marks[sem][id]
        display_result(id,sem,data)
    }
}


function display_result(id,sem,data){
    document.getElementById("results").style.display="block";
    const tableBody = document.getElementById('resultBody');
    tableBody.innerHTML="";
    for(let k in data){
      const row = document.createElement('tr');
      let inter=parseInt(data[k][0]);
      let exter=parseInt(data[k][1]);
      row.innerHTML = `
        <td>${subjects[sem][k][2]}</td>
        <td>${inter}</td>
        <td>${exter}</td>
        <td>${inter+exter}</td>
        <td>${data[k][2]}[${grades[data[k][2]]}]</td>
      `;
      tableBody.appendChild(row);
    }
    document.getElementById("sgpa").textContent=parseFloat(student_details[id][sem]).toFixed(4)
    let sgpa=parseInt(student_details[id][sem])
    if(sgpa===0){
      spga=0;
      let fail_sub=[];
      for(let k in data){
        let res=parseInt(data[k][2])
        if(res!==0){
          sgpa+=res*parseFloat(subjects[sem][k][0])
        }
        else{
          fail_sub.push(k)
        }
      }
      let cgs=document.getElementById("changegpa-section");
      cgs.style.display="block"
      cgs.innerHTML=""
      let p=document.createElement("p")
      p.textContent="Estimate your SGPA";
      p.className="fs-3"
      cgs.appendChild(p)
      for(let idx in fail_sub){
        let div=document.createElement("div")
        div.class="mt-3"
        
        let label=document.createElement("label")
        label.htmlfor=fail_sub[idx]
        label.className="form-label"
        label.textContent=subjects[sem][fail_sub[idx]][1]
        
        let select=document.createElement("select");
        select.id=fail_sub[idx]
        select.className="form-select"
        select.addEventListener("change",sgpachange.bind(null,fail_sub,sem,sgpa))
        let i=0;
        while(i<11){
          opt=document.createElement("option")
          opt.value=i
          opt.textContent=i
          select.appendChild(opt)
          if(i==0){
            i=4;
          }
          i++;
        }
        div.appendChild(label)
        div.appendChild(select)
        cgs.appendChild(div)
      }
    }
    else{
      document.getElementById("changegpa-section").style.display="none";
    }
}

function sgpachange(fail_sub,sem,sgpa){
    r=0
    isokay=true
    for(let v of fail_sub){
      t=parseInt(document.getElementById(v).value)*parseFloat(subjects[sem][v][0])
      r+=t
      if(t==0){
        isokay=false
      }
    }
    if(isokay){
      document.getElementById("sgpa").textContent=((sgpa+r)/total_credits[sem]).toFixed(4);
    }
    else{
      document.getElementById("sgpa").textContent=0;
    }
    
}


var linegraph=null;

function get_all_sgpa(id){
  let d=[]
  let label=[]
  for(let k in student_details[id]){
    if(k==="name" || k==="sec"|| k==="cgpa"){
        continue
    }
    if(id.startsWith("22") && (k==="sem1" || k==="sem2")){
      continue
    }
    switch(k){
      case "sem1":
        label.push("I-I")
        break
      case "sem2":
        label.push("I-II")
        break
      case "sem3":
        label.push("II-I")
        break
      case "sem4":
        label.push("II-II")
        break
      case "sem5":
        label.push("III-I")
        break
      case "sem6":
        label.push("III-II")
        break
      case "sem7":
        label.push("IV-I")
        break
      case "sem8":
        label.push("IV-II")
        break
    }
    d.push(parseFloat(student_details[id][k]))
  }
  return [d,label]
}
function show_linechart(id){
  if(linegraph){
    linegraph.destroy();
    linegraph=null;
  }
  let [d,labels]=get_all_sgpa(id)
  var ctx = document.getElementById('linechart').getContext('2d');
  linegraph= new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Semesters wise SGPA',
        data: d,
        borderColor: 'rgb(255, 193, 7)',
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x:{
          ticks:{
            color:"white",
          }
        },
        y: {
          beginAtZero: true,
          min:5,
          
          ticks:{
              color:"white",
            }
          }
        },
        plugins: {
            legend: {
                labels: {
                    color: 'white'
                }
            }
        }

      }
  });
}


//analytics



var piechart=null;
var barchart=null;


function  select_sem_analytics(ele){
  
  if(ele.value==="cgpa"){
    document.getElementById("bar").style.display="none"
    document.getElementById("sub-select").style.display="none";
    document.getElementById("sub-gpas").style.display="none";

  }
  else{
    document.getElementById("bar").style.display="block"
    document.getElementById("sub-select").style.display="block";
    show_subjects(document.getElementById("select-subject"),ele.value)
  }
  section_change()
}
function get_section(){
  const rb = document.querySelectorAll('input[name="section"]');
  let sr = null;
  rb.forEach(radio => {
    if (radio.checked) {
      sr = radio.value;
    }
  });
  return sr
}
function section_change(){
  let sr=get_section()
  subject_clicked(document.getElementById("select-subject"))
}

function show_subjects(ele,sem){
  ele.innerHTML=""
  let option = document.createElement("option")
    option.textContent="All Subjects"
    option.value="all"
    ele.appendChild(option)
  for(let k in subjects[sem]){
    let option = document.createElement("option")
    option.textContent=subjects[sem][k][2]
    option.value=k
    ele.appendChild(option)
  }
  
}

function subject_clicked(ele){
  show_graph(ele.value)
}

function show_graph(sub){
  let sem=document.getElementById("year-analytics").value
  let sec=get_section()
  if(sem==="cgpa"){
    show_fp_piegraph("all",sem,sec)
    sub="all"
 }else{
    show_fp_piegraph(sub,sem,sec)
    show_bargraph(sub,sem,sec)
 }
 if(sub==="all"){
    show_gpas(sem,sec)
 }else{
    call_sub_gpas(sem,sub,sec)
 }
}

function get_fp(sem,sub,sec){
  let p=0,f=0;
  if(sub!=="all"){
    for(let id in marks[sem]){
      if((sem==="sem1" || sem==="sem2") && id.startsWith("22")){
        continue;
      }
      if(sec==="a" || sec==="b"){
        if(student_details[id]["sec"]===sec.toUpperCase()){
          if(marks[sem][id][sub]===undefined){
            continue
          }
          if(parseInt(marks[sem][id][sub][2])>0){
            p+=1
          }
          else{
            f+=1
          }
        }
      }
      else{
        if(marks[sem][id][sub]===undefined){
          continue
        }
        if(parseInt(marks[sem][id][sub][2])>0){
            p+=1
        }
        else{
            f+=1
        }
      }
    }
    return [p,f]
  }else{
    for(let id in student_details){
      if((sem==="sem1" || sem==="sem2") && id.startsWith("22")){
        continue;
      }
      if(sec==="a" || sec==="b"){
        if(student_details[id]["sec"]===sec.toUpperCase()){
          if(student_details[id][sem]>0){
            p+=1
          }
          else{
            f+=1
          }
        }
      }
      else{
        if(student_details[id][sem]>0){
            p+=1
        }
        else{
            f+=1
        }
      }
    }
    return [p,f]
  }
}
function show_fp_piegraph(sub,sem,sec){
  [x,y]=get_fp(sem,sub,sec)
  
  if (piechart) {
    piechart.destroy();
    piechart = null;
  }
  var ctx1;
  ctx1=document.getElementById('piechart').getContext('2d');
  piechart = new Chart(ctx1, {
    type: 'doughnut',
      data: 
      {
        labels: ['Pass', 'Fail'],
        datasets: [
          {
            label: "pie chart",
            data: [x, y],
            backgroundColor: ['#FF6384', '#36A2EB'],
            borderColor: ['#FF6384', '#36A2EB'],
            borderWidth: 1
          }
        ]
      },
      options: 
        {
          responsive: true,
          maintainAspectRatio: false,
          plugins: 
            {
              legend: {
                    position: 'top',
                },
              tooltip: {
                callbacks: {
                        label: function (tooltipItem) {
                            return tooltipItem.label + ': ' + tooltipItem.raw;
                  }
                }
              },
              datalabels: {
                formatter: function (value, context) {
                        var total = context.dataset.data[0] + context.dataset.data[1];
                        var percentage = (value / total) * 100;
                        return percentage.toFixed(2) + '%';
                    },
                    color: '#fff',
                    anchor: 'center', 
                    align: 'center' 
                }
            },
            cutout: '60%',
        },
        plugins: [ChartDataLabels]
    });
}



function bargraph_allsub(sem,sec){
  p=[]
  f=[]
  labels=[]
  for(let sub in subjects[sem]){
    [x,y]=get_fp(sem,sub,sec)
    p.push(x)
    f.push(y)
    labels.push(subjects[sem][sub][2])
  }
  return [p,f,labels]
}

function bargraph_sec_ab(sem,sub,sec){
  go=0;
  gaa=0
  ga=0
  gbb=0
  gb=0
  gc=0
  gf=0
  for(let id in marks[sem]){
    if(sec!=='ab'){
      if((sec.toUpperCase()!==student_details[id]["sec"])){
        continue;
      }
    }
    if(marks[sem][id][sub]===undefined){
      continue
    }
    let v=parseInt(marks[sem][id][sub][2])
    switch(v){
      case 10:go+=1;break;
      case 9:gaa+=1;break;
      case 8: ga+=1;break;
      case 7: gbb+=1;break;
      case 6:gb+=1;break;
      case 5: gc+=1;break;
      case 0: gf+=1;break
    }
  }
  return [go,gaa,ga,gbb,gb,gc,gf]
}

function show_bargraph(sub,sem,sec){
  if(barchart){
      barchart.destroy();
      barchart = null;
    }
  if(sub==="all"){
    [d1,d2,labels]=bargraph_allsub(sem,sec)
    var ctx2 = document.getElementById('barchart').getContext('2d');
    barchart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Total pass',
          data: d1,
          backgroundColor: '#FF6384', 
          borderColor: '#FF6384',
          borderWidth: 1
          }, 
          {
          label: 'Total Fail',
          data: d2,
          backgroundColor: '#36A2EB', 
          borderColor: '#36A2EB',
          borderWidth: 1
          }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              offset: true
            }
          },
          y: {
            beginAtZero: true,
            min:0,
            max: Math.max(...d1, ...d2) + 15,
            ticks:{
              stepSize:50,
            }
            
          }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                  return tooltipItem.label + ': ' + tooltipItem.raw;
                            }
            }
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#fff',
            font: {
              weight: 'bold',
              size: 10
            },
            formatter: function (value) {
                return value;
                }
          }
        },
        barPercentage: 0.8,
        categoryPercentage: 0.8
      },
      plugins: [ChartDataLabels]
    });
  }else{
    d=bargraph_sec_ab(sem,sub,sec)
    var ctx2 = document.getElementById('barchart').getContext('2d');
    barchart = new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'],
        datasets: [{
          label: "Grades",
          data: d,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF5733', '#66FF66', '#FF9999', '#4D4DFF'],
          borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#FF5733', '#66FF66', '#FF9999', '#4D4DFF'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
            }
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                  return tooltipItem.label + ': ' + tooltipItem.raw;
                  }
            }
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            color: '#fff',
            font: {
              weight: 'bold',
              size: 10
            },
            formatter: function (value) {
                return value;
              }
          }
        },
        barPercentage: 0.8,
        categoryPercentage: 0.8
      },
      plugins: [ChartDataLabels]
    });
  }
}


function sort_gpas(sem,sec){
  ids=[]
  gpas=[]
  if(sec=="ab"){
    for(let id in student_details){
      if(parseFloat(student_details[id][sem])==0){
        continue
      }
      if(ids.length==0){
        ids.push(id);
        gpas.push(student_details[id][sem])
      }
      else{
        let res=student_details[id][sem]
        let islast=true
        for(let i=0;i<gpas.length;i++){
          if(res>gpas[i]){
            gpas.splice(i,0,res)
            ids.splice(i,0,id)
            islast=false
            break
          }
        }
        if(islast==true){
          gpas.push(res)
          ids.push(id)
        }
      }
    }
  }
else{
    for(let id in student_details){
      if(parseFloat(student_details[id][sem])==0 || student_details[id]["sec"]!=sec.toUpperCase()){
        continue
      }
      if(ids.length==0){
        ids.push(id);
        gpas.push(student_details[id][sem])
      }
      else{
        let res=student_details[id][sem]
        let islast=true
        for(let i=0;i<gpas.length;i++){
          if(res>gpas[i]){
            gpas.splice(i,0,res)
            ids.splice(i,0,id)
            islast=false
            break
          }
          
        }
        if(islast==true){
          gpas.push(res)
          ids.push(id)
        }
      }
    }
  }
  return[ids,gpas]
}

function show_gpas(sem,sec){
  document.getElementById("sub-gpas").style.display="none";
  let [ids,gpas]=sort_gpas(sem,sec)
  let g=document.getElementById("gpas")
  g.style.display="block"
  g.innerHTML=""
  let p=document.createElement("p")
  p.className="fw-bold fs-3 text-center"
  p.textContent=sem==="cgpa"?"CGPA":"SGPA";
  
  
  g.appendChild(p)
  
  ids.map((val,idx)=>{
    let div=document.createElement("div")
    div.className="d-flex justify-content-between mt-3 fs-3"
    let s1=document.createElement("span")
    let s2=document.createElement("span")
    let s3=document.createElement("span")
    s1.textContent=idx+1
    s2.textContent=val
    s3.textContent=parseFloat(gpas[idx]).toFixed(4)
    s3.className='text-warning'
    div.appendChild(s1)
    div.appendChild(s2)
    div.appendChild(s3)
    g.appendChild(div)
  })
}


function call_sub_gpas(sem,sub,sec){
  document.getElementById("gpas").style.display="none";
  document.getElementById("sub-gpas").style.display="block"
  let sg=document.getElementById("sub-g")
  grade_change(document.getElementById("select-grade"))
}
function grade_change(ele){
  let sem=document.getElementById("year-analytics").value;
  let sec=get_section()
  let sub=document.getElementById("select-subject").value;
  show_sub_gpa(ele.value,sem,sub,sec)
}
function show_sub_gpa(grd,sem,sub,sec){
  let sg=document.getElementById("sub-g");
  sg.innerHTML=""
  let m=[],ids=[];
  
  if(sec==="ab"){
    for(let id in marks[sem]){
      if(marks[sem][id][sub]===undefined){
        continue
      }
      if(marks[sem][id][sub][2]==grd){
        ids.push(id)
        m.push(parseInt(marks[sem][id][sub][0])+parseInt(marks[sem][id][sub][1]))
      }
    }
  }else{
    for(let id in marks[sem]){
      if(marks[sem][id][sub]===undefined){
        continue
      }
      if(student_details[id]["sec"]!==sec.toUpperCase()){
        continue
      }
      if(marks[sem][id][sub][2]===grd){
        ids.push(id)
        m.push(parseInt(marks[sem][id][sub][0])+parseInt(marks[sem][id][sub][1]))
      }
    }
  }
  ids.map((id,idx)=>{
    let div=document.createElement("div")
    div.className="d-flex justify-content-between mt-3 fs-3"
    let s1=document.createElement("span")
    let s2=document.createElement("span")
    s1.textContent=id
    s2.textContent=m[idx]
    div.appendChild(s1)
    div.appendChild(s2)
    sg.appendChild(div)
  })
  if(ids.length===0){
    let p=document.createElement("p")
    p.textContent="Oops! No student got this grade.."
    p.className='text-danger mt-2'
    sg.appendChild(p)
  }
}
