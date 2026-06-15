import{r as o,j as e,S as ue}from"./index-BQcR-kcz.js";import{u as be,A as fe,M as L,B as me,a as Ee,R as Se,b as Ae}from"./AlertMessage-DTeGGKow.js";import"./index-C40x7raN.js";var u={};const ye=()=>{const E=be(),h=E.udiseNumber,x=E.srNo,d=E.academicYear,g=E.classValue,p=E.selectedExamName,[J,ve]=o.useState([]),[we,Y]=o.useState([]),[Re,q]=o.useState({}),[r,R]=o.useState(null),[V,I]=o.useState(!0),[M,K]=o.useState(""),[N,Z]=o.useState(""),[s,Q]=o.useState(localStorage.getItem("language")||"English"),[F,X]=o.useState(""),[ee,z]=o.useState(!1),[O,se]=o.useState([]);o.useEffect(()=>{d&&g&&te()},[d,g]);const te=async()=>{try{const t=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/subjectSequence/${d}/${g}.json`);if(!t.ok)throw new Error("Failed to fetch subject sequence");const n=await t.json(),i=Object.keys(n).sort((a,l)=>parseInt(a)-parseInt(l)).map(a=>n[a]);se(i)}catch(t){console.error("Error fetching subject sequence:",t)}};o.useEffect(()=>{if(F){z(!0);const t=setTimeout(()=>{z(!1),X("")},3e3);return()=>clearTimeout(t)}},[F]),o.useEffect(()=>{const t=localStorage.getItem("language")||"English";Q(t)},[]);const ne=async()=>{try{const t=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/schoolData.json`);if(!t.ok)throw new Error("Failed to fetch school name");const n=await t.json();K(n.schoolName||" "),Z(n.schoolLogo||"")}catch(t){console.error("Error fetching school name:",t)}};o.useEffect(()=>{p&&g&&d&&ie()},[p,g,d]),o.useEffect(()=>{x&&(async()=>{try{const n=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${x}.json`);if(!n.ok)throw new Error("Failed to fetch student info");const i=await n.json();R(a=>({...a,studentName:i.stdName,stdMother:i.stdMother,stdFather:i.stdFather,stdSurname:i.stdSurname,dob:i.dob,division:i.division,motherTounge:i.motherTounge,studentId:i.studentId,gender:i.gender,rollNo:i.rollNo}))}catch(n){console.error("Error fetching student info:",n)}})()},[x,h]);const re=async()=>{try{const t=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${x}/result/${d}/First Semester.json`),n=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${x}/result/${d}/${p}.json`),i=await t.json(),a=await n.json(),l=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${x}/result/${d}/First Semester/nondi.json`),c=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${x}/result/${d}/${p}/nondi.json`);if(!l.ok||!c.ok)throw new Error("Failed to fetch nondi data");const b=await l.json(),A=await c.json();R({...r,nondi:A||{},firstSemester:b||{}});const m={};new Set([...Object.keys(i||{}),...Object.keys(a||{})]).forEach(j=>{const v=i?.[j]?.Akarik?.Total?k(i[j].Akarik.Total+(i[j].Sanklik?.Total||0)):" ",w=a?.[j]?.Akarik?.Total||0,f=a?.[j]?.Sanklik?.Total||0,$=w+f,D=k($);m[j]={akarikTotal:w,sankalikTotal:f,total:$,grade:D,firstSemesterGrade:v}}),R(j=>({...j,results:m})),I(!0)}catch(t){console.error("Error fetching student data:",t)}};o.useEffect(()=>{d&&g&&p&&x&&(async()=>{try{const n=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${x}.json`);if(!n.ok)throw new Error("Failed to fetch student info");const i=await n.json(),a=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${x}/result/${d}/First Semester.json`),l=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${x}/result/${d}/${p}.json`),c=await a.json(),b=await l.json(),A=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${x}/result/${d}/First Semester/nondi.json`),m=await fetch(`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${x}/result/${d}/${p}/nondi.json`),y=await A.json(),j=await m.json(),v={};new Set([...Object.keys(c||{}),...Object.keys(b||{})]).forEach(f=>{const $=c?.[f]?.Akarik?.Total?k(c[f].Akarik.Total+(c[f].Sanklik?.Total||0)):" ",D=b?.[f]?.Akarik?.Total||0,H=b?.[f]?.Sanklik?.Total||0,W=D+H,je=k(W);v[f]={akarikTotal:D,sankalikTotal:H,total:W,grade:je,firstSemesterGrade:$}}),R({studentName:i.stdName,stdMother:i.stdMother,stdFather:i.stdFather,stdSurname:i.stdSurname,dob:i.dob,division:i.division,motherTounge:i.motherTounge,studentId:i.studentId,gender:i.gender,rollNo:i.rollNo,results:v,nondi:{specialEntries:j.specialEntries||"",interestsAndHobbies:j.interestsAndHobbies||"",necessaryCorrections:j.necessaryCorrections||""},firstSemester:{specialEntries:y.specialEntries||"",interestsAndHobbies:y.interestsAndHobbies||"",necessaryCorrections:y.necessaryCorrections||""}}),I(!0)}catch(n){console.error("Error fetching student data:",n)}})()},[d,g,p,x]),o.useEffect(()=>{ne(),d&&g&&p&&x&&re()},[d,g,p,x]);const ie=async()=>{try{const t=J.filter(l=>l.currentClass===g);Y(t);const n=t.map(async l=>{const c=await le(l.srNo,d,p);return{srNo:l.srNo,marks:c}}),a=(await Promise.all(n)).reduce((l,{srNo:c,marks:b})=>(l[c]=b,l),{});q(a)}catch(t){console.error("Error fetching marks data:",t)}},le=async(t,n,i)=>{const a=`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${t}/result/${n}/${i}.json`;try{const l=await fetch(a);if(!l.ok)throw new Error(`Error fetching data: ${l.statusText}`);return await l.json()||{}}catch(l){return console.error("Error fetching marks data:",l),{}}},[_,Ne]=o.useState(""),de=t=>t>=91?"A1":t>=81?"A2":t>=71?"B1":t>=61?"B2":t>=51?"C1":t>=41?"C2":t>=33?"D1":t>=21?"D2":"Absent",ae=t=>t>=91?"अ-1":t>=81?"अ-2":t>=71?"ब-1":t>=61?"ब-2":t>=51?"क-1":t>=41?"क-2":t>=33?"ड-1":t>=21?"ड-2":"अनुपस्थित",k=t=>s==="English"?de(t):ae(t),oe=["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"],[S,U]=o.useState({Present:{},Absent:{},Leave:{}});o.useEffect(()=>{(async()=>{const n=_.serialNo,i=d.split("-")[0],a=`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/Attendance/${n}/Presenty/${i}`;try{const l={Present:{},Absent:{},Leave:{}};for(const c of oe){const b=`${a}/${c}.json`,A=await fetch(b);if(A.ok){const m=await A.json();if(m){let y=0,j=0,v=-1;for(const w in m){const f=m[w]?.present;f==="present"?y++:f==="absent"?j++:f==null&&v++}l.Present[c]=y,l.Absent[c]=j,l.Leave[c]=v}else console.warn(`No data found for ${c}`)}else console.error(`Failed to fetch data for ${c}:`,A.statusText)}U(l)}catch(l){console.error("Error fetching attendance data:",l)}})()},[_,h,d]);const C=async(t,n,i)=>{const a=_.serialNo,l={...S};l[t][n]=i,U(l);const c=`${u.REACT_APP_FIREBASE_DATABASE_URL}/schoolRegister/${h}/studentData/${a}/Attendance/${d}/${n}/${t}.json`;try{const b=await fetch(c,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(i)});b.ok||console.error("Failed to save data:",b.statusText)}catch(b){console.error("Error saving data:",b)}},[ce,he]=o.useState(""),[xe,ge]=o.useState(""),T=["Jun","Jul","Aug","Sep","Oct","Nov"],G=["Dec","Jan","Feb","Mar","Apr","May"],P=t=>s==="English"?t:{Jun:"जून",Jul:"जुलै",Aug:"ऑगस्ट",Sep:"सप्टेंबर",Oct:"ऑक्टोबर",Nov:"नोव्हेंबर",Dec:"डिसेंबर",Jan:"जानेवारी",Feb:"फेब्रुवारी",Mar:"मार्च",Apr:"एप्रिल",May:"मे"}[t],B=t=>s==="English"?t:{Present:"उपस्थित",Absent:"गैरहजर",Leave:"रजा"}[t],pe=()=>{const t=document.querySelector(".modal-body");if(t){const n=window.open("","","height=600,width=800");n.document.write(`
      <html>
        <head>
          <title>Print Student Report</title>
          <style>
            /* General body styles */
            body {
              font-family: 'Poppins', sans-serif;
              margin: 0;
              padding: 0;
              color: black;
            }
            @page {
                size: A4 Landscape; /* auto is the initial value */
              margin: 3mm; /* this affects the margin in the printer settings */
            }
            .container {
              width: 297mm;
              height: 200mm;
              margin: 0 auto;
              box-sizing: border-box;
              padding: 3mm;
              border: 3px solid #0e0303;
              overflow: hidden;
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }

            .left, .right {
              width: 48%;
              border: 2px solid black;
              padding: 10px;
              box-sizing: border-box;
            }
.gradable{
position: absolute; /* add this */
bottom: 2px; /* add this */
left: 1%; /* add this */
width: 98%; /* add this */
}
         


.grad{
position: absolute; /* add this */
bottom: 0; /* add this */
left: 20px; /* add this */
width: 100%; /* add this */
}



            .left-box {
              background-color: #f9f9f9;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 10px;
            }

            .school-info {
              display: flex;
              align-items: center;
              margin-bottom: 20px;
            }

            .school-info img {
              width: 100px;
              height: 100px;
              object-fit: cover;
              margin-right: 20px;
            }

            .school-info h2 {
              font-size: 18px;
              font-weight: bold;
              margin: 0;
            }

            .student-info {
              margin-top: 20px;
            }

            .student-info h3 {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
            }

            .student-info ul {
              list-style: none;
              padding: 0;
              margin: 0;
            }

            .student-info li {
              margin-bottom: 10px;
            }

            .student-info label {
              font-weight: bold;
              margin-right: 10px;
            }

            .student-info span {
              font-size: 14px;
              color: #666;
            }

            .student-info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .student-info-grid section {
              background-color: #ffffff;
              padding: 15px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            .student-info-grid h2 {
              font-size: 1em;
              margin-bottom: 10px;
              color: #333;
              border-bottom: 2px solid #ddd;
              padding-bottom: 5px;
            }

            .student-info-grid p {
              margin: 1px 0;
              font-size: 0.9em;
            }

            .student-info-grid label {
              font-weight: bold;
              color: #555;
            }

            .student-info-grid span {
              margin-left: 5px;
              color: #666;
            }

            .student-info-grid p:last-child {
              margin-bottom: 0;
            }

            .left {
              border: 2px solid #0f0202;
              padding: 20px;
              position: relative;
            }

            .right {
              position: relative;
              width: 48% !important;
              border: 2px solid #0e0101;
              padding: 10px;
              overflow: hidden;
            }

            /* Table styles */
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }

            th, td {
              border: 1px solid #130606;
              padding: 5px;
              text-align: left;
              word-wrap: break-word;
              box-sizing: border-box;
            }

            .table-striped tbody tr:nth-of-type(odd) {
              background-color: rgba(0, 0, 0, 0.05); /* Stripe effect */
            }

            .table-bordered {
              border: 1px solid #130606;
            }

           .grade-table {
margin-top: 20px;
}

.grade-table table {
width: 100%;
border-collapse: collapse;
}

.grade-table th, .grade-table td {
border: 1px solid #ccc;
padding: 5px;
text-align: center;
box-sizing: border-box;
}

.grade-table thead th {
background-color: #f4f4f4;
}

.grade-table tbody td {
text-align: center;
}


            .attendance-table th, .attendance-table td {
              width: 33%;
            }
              /* General Table Styles */
table {
width: 100%;
border-collapse: collapse;
margin-top: 20px; /* Adds space above the table */
}

thead {
background-color: #f2f2f2; /* Light grey background for header */
}

th, td {
border: 1px solid #ddd; /* Light grey border */
padding: 8px; /* Space within cells */
text-align: left; /* Align text to the left */
}

th {
background-color: #f4f4f4; /* Slightly darker grey background for header cells */
font-weight: bold; /* Bold text in header */
}

input[type="text"] {
width: 100%; /* Full width of cell */
box-sizing: border-box; /* Include padding and border in element's total width and height */
border: 1px solid #ccc; /* Light grey border for input */
padding: 4px; /* Space inside input field */
font-size: 14px; /* Text size inside input */
}

input[type="text"]:focus {
outline: none; /* Remove default focus outline */
border-color: #007bff; /* Border color on focus */
box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25); /* Shadow effect on focus */
}

/* Zebra striping for table rows */
tbody tr:nth-child(odd) {
background-color: #fafafa; /* Light grey background for odd rows */
}

            /* Ensure the right container does not overflow */
            .right {
              overflow: hidden; /* Clipping any content that exceeds the container bounds */
            }
          </style>
        </head>
        <body>
          ${t.innerHTML}
        </body>
      </html>
    `),n.document.close(),n.focus(),n.print()}else console.error("Print content not found")};return e.jsxs("div",{children:[e.jsx(fe,{message:F,show:ee}),e.jsxs("div",{className:" main-content-of-page",style:{top:0},children:[e.jsxs(L,{show:V,dialogClassName:"modal-80w",children:[e.jsx(L.Body,{children:p==="Second Semester"&&r?e.jsxs("div",{children:[e.jsxs("div",{className:"container ",children:[e.jsxs("div",{className:"left",children:[e.jsx("div",{className:"left-box",children:e.jsxs("div",{className:"school-info",children:[N&&e.jsx("div",{children:e.jsx("img",{src:N,alt:"$Logo"})}),e.jsx("h2",{children:M})]})}),e.jsx("br",{}),e.jsxs("div",{class:"student-info-grid",children:[e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Name :":"नाव :"}),e.jsxs("span",{children:[r?.studentName||" "," ",r?.stdFather||" "," ",r?.stdSurname||" "]})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Roll No :":"हजेरी क्रमांक :"}),e.jsx("span",{children:r?.rollNo||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Exam :":"परीक्षा सत्र :"}),e.jsx("span",{children:p||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Year :":"वर्ष :"}),e.jsx("span",{children:d||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Class :":"वर्ग :"}),e.jsx("span",{children:g||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Mother Name :":"आईचे नाव :"}),e.jsx("span",{children:r?.stdMother||""})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"DOB :":"जन्मतारीख :"}),e.jsx("span",{children:r?.dob||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Division :":"तुकडी :"}),e.jsx("span",{children:r?.division||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Mother Tongue :":"मातृभाषा :"}),e.jsx("span",{children:r?.motherTounge||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Student ID :":"विद्यार्थी आयडी :"}),e.jsx("span",{children:r?.studentId||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Gender :":"लिंग :"}),e.jsx("span",{children:r?.gender||" "})]})]}),e.jsx("div",{className:"gradable",children:e.jsxs("table",{children:[e.jsxs("thead",{children:[e.jsxs("tr",{children:[e.jsx("th",{rowspan:"2",children:s==="English"?"Subject :":"विषय"}),e.jsx("th",{colspan:"2",children:s==="English"?"First Semester":"प्रथम सत्र"}),e.jsx("th",{colspan:"2",children:s==="English"?"Second Semester":"द्वितीय सत्र"})]}),e.jsxs("tr",{children:[e.jsx("th",{children:"Kg"}),e.jsx("th",{children:"Cm"}),e.jsx("th",{children:"Kg"}),e.jsx("th",{children:"Cm"})]})]}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:s==="English"?"Weight":"वजन"}),e.jsx("td",{}),e.jsx("td",{}),e.jsx("td",{}),e.jsx("td",{})]}),e.jsxs("tr",{children:[e.jsx("td",{children:s==="English"?"Hight ":"उंची"}),e.jsx("td",{}),e.jsx("td",{}),e.jsx("td",{}),e.jsx("td",{})]})]})]})})]}),e.jsxs("div",{className:"right",children:[e.jsx("h2",{children:s==="English"?"Attendance:":"हजेरी"}),e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="English"?"Type:":"प्रकार"}),T.map((t,n)=>e.jsx("th",{children:P(t)},n))]})}),e.jsx("tbody",{children:["Present","Absent","Leave"].map(t=>e.jsxs("tr",{children:[e.jsx("td",{children:B(t)}),T.map((n,i)=>e.jsx("td",{children:e.jsx("input",{type:"text",value:t==="Leave"&&S[t][n]<0?"":S[t][n]||"",onChange:a=>C(t,n,a.target.value)})},i))]},t))})]}),e.jsx("h5",{style:{marginTop:"10px"},children:s==="English"?"Second Semester Attendance:":"द्वितीय सत्राची हजेरी:"}),e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="English"?"Type:":"प्रकार"}),G.map((t,n)=>e.jsx("th",{children:P(t)},n))]})}),e.jsx("tbody",{children:["Present","Absent","Leave"].map(t=>e.jsxs("tr",{children:[e.jsx("td",{children:B(t)}),G.map((n,i)=>e.jsx("td",{children:e.jsx("input",{type:"text",value:t==="Leave"&&S[t][n]<0?"":S[t][n]||"",onChange:a=>C(t,n,a.target.value)})},i))]},t))})]}),e.jsx("p",{style:{marginTop:"5px"},children:s==="English"?"After the summer vacation school will start from.":"उन्हाळी सुटीनंतर शाळा दि. पासून सुरू होईल."}),e.jsx("div",{style:{width:"150px"},children:e.jsx("input",{type:"date",value:ce,onChange:t=>he(t.target.value)})}),e.jsx("div",{className:"grad",children:e.jsxs("p",{children:[s==="English"?" Instructions for parents:":"पालकांसाठी सूचना",e.jsxs("li",{children:["  ",s==="English"?" Students should wear school uniform every day.":"विद्यार्थ्यांनी दररोज शालेय गणवेश परिधान करावा."]}),e.jsxs("li",{children:[" ",s==="English"?"  A student should do the study given in school every day.":"विद्यार्थ्याने शाळेत दिलेला अभ्यास दररोज करावा."]}),e.jsxs("li",{children:[" ",s==="English"?" Students should attend school on time and regularly every day.":"विद्यार्थ्यांनी दररोज वेळेवर व नियमितपणे शाळेत हजर राहावे."]}),e.jsxs("li",{children:[" ",s==="English"?" Students should not carry valuables, money. ":"विद्यार्थ्यांनी मौल्यवान वस्तू, पैसे घेऊन जाऊ नये."]}),e.jsxs("li",{children:["  ",s==="English"?" Students should follow the rules and discipline of the school. ":"विद्यार्थ्यांनी शाळेचे नियम व शिस्तीचे पालन करावे."]})]})}),e.jsx("p",{style:{marginTop:"70px",marginLeft:"350px"},children:s==="English"?"Parents Signature ":"पालकांची सही"})]})]}),e.jsxs("div",{className:"container mt-1",children:[e.jsxs("div",{className:"left",children:[e.jsx("h2",{children:s==="English"?"Student Progress Report ":"विद्यार्थी प्रगती अहवाल"}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"roll-no",children:s==="English"?"Roll No: ":"हजेरी क्रमांक"}),e.jsx("span",{children:r?.rollNo||" "})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"student-name",children:s==="English"?"Student Name: ":"विद्यार्थ्याचे नाव"}),e.jsxs("span",{children:[r?.studentName||" "," ",r?.stdFather||" "," ",r?.stdSurname||" "]})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"class",children:s==="English"?"Class: ":"वर्ग"}),e.jsx("span",{children:g||" "})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"exam-roll-no",children:s==="English"?"Exam: ":"परीक्षा"}),e.jsx("span",{children:p||" "})]}),r?.results?e.jsxs("table",{className:"table table-striped table-bordered",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="English"?"Subject ":"विषय"}),e.jsx("th",{children:s==="English"?"First Semester ":"पहिली सत्र"}),e.jsx("th",{children:s==="English"?"Second Semester ":"द्वितीय सत्र"})]})}),e.jsx("tbody",{children:O.filter((t,n)=>t&&n!==0).map(t=>{const n=r.results[t]||{};return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("b",{children:t})}),e.jsx("td",{children:e.jsx("b",{children:n.firstSemesterGrade||"Absent"})})," ",e.jsx("td",{children:e.jsx("b",{children:n.grade||"Absent"})})," "]},t)})})]}):e.jsx("p",{children:s==="English"?"No results available.":"कोणतेही प्रगतीपत्रक उपलब्ध नाहीत."}),e.jsx("div",{}),e.jsxs("div",{className:"grad",style:{display:"flex",alignItems:"center"},children:[e.jsx("label",{style:{marginRight:"20px",marginBottom:"2px",marginLeft:"20px"},htmlFor:"class-teacher",children:s==="English"?"Class Teacher":"वर्गशिक्षक"}),e.jsx("label",{style:{marginRight:"20px",marginBottom:"2px",marginLeft:"45%"},htmlFor:"principal",children:s==="English"?"Principal ":"प्राचार्य"})]})]}),e.jsxs("div",{className:"right",children:[e.jsx("h2",{style:{textAlign:"center",color:"black",fontFamily:"Arial, sans-serif",fontWeight:"bold",marginBottom:"20px"},children:s==="English"?"Nondi ":"नोंदी"}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",fontFamily:"Arial, sans-serif"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{color:"black",textAlign:"center"},children:[e.jsxs("th",{colSpan:"",style:{padding:"2px",border:"1px solid #ddd",fontSize:"16px"},children:[s==="English"?"First Semester ":"पहिली सत्र"," "]}),e.jsxs("th",{colSpan:"",style:{padding:"2px",border:"1px solid #ddd",fontSize:"16px"},children:[s==="English"?"Second Semester ":"दुसरी सत्र"," "]})]})}),e.jsxs("tbody",{children:[e.jsx("tr",{style:{color:"black",textAlign:"center"},children:e.jsx("th",{colSpan:"2",style:{padding:"2px",border:"1px solid #ddd",fontSize:"16px"},children:s==="English"?"Special Progress":"विशेष प्रगती"})}),e.jsxs("tr",{style:{backgroundColor:"#ffffff"},children:[e.jsx("td",{style:{width:"50%",padding:"2px",border:"1px solid #ddd",verticalAlign:"top"},children:e.jsx("textarea",{id:"special-progress",style:{width:"100%",padding:"10px",borderRadius:"4px",border:"1px solid #ccc",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.1)",resize:"none",fontSize:"14px",height:"100px"},value:r?.firstSemester?.specialEntries||"No data available",readOnly:!0})}),e.jsx("td",{style:{width:"50%",padding:"2px",border:"1px solid #ddd",verticalAlign:"top"},children:e.jsx("textarea",{id:"special-progress",style:{width:"100%",padding:"10px",borderRadius:"4px",border:"1px solid #ccc",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.1)",resize:"none",fontSize:"14px",height:"100px"},value:r?.nondi?.specialEntries||"No data available",readOnly:!0})})]}),e.jsx("tr",{style:{color:"black",textAlign:"center"},children:e.jsx("th",{colSpan:"2",style:{padding:"2px",border:"1px solid #ddd",fontSize:"16px"},children:s==="English"?"Hobbies":"छंद"})}),e.jsxs("tr",{style:{backgroundColor:"#ffffff"},children:[e.jsx("td",{style:{width:"33%",padding:"2px",border:"1px solid #ddd",verticalAlign:"top"},children:e.jsx("textarea",{id:"special-progress",style:{width:"100%",padding:"10px",borderRadius:"4px",border:"1px solid #ccc",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.1)",resize:"none",fontSize:"14px",height:"100px"},value:r?.firstSemester?.interestsAndHobbies||"No data available",readOnly:!0})}),e.jsx("td",{style:{padding:"2px",border:"1px solid #ddd",verticalAlign:"top"},children:e.jsx("textarea",{id:"hobbies",style:{width:"100%",padding:"10px",borderRadius:"4px",border:"1px solid #ccc",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.1)",resize:"none",fontSize:"14px",height:"100px"},value:r?.nondi?.interestsAndHobbies||"No data available",readOnly:!0})})]}),e.jsx("tr",{style:{color:"black",textAlign:"center"},children:e.jsx("th",{colSpan:"2",style:{padding:"2px",border:"1px solid #ddd",fontSize:"16px"},children:s==="English"?"Required Improvements":"आवश्यक सुधारणा"})}),e.jsxs("tr",{style:{backgroundColor:"#ffffff"},children:[e.jsx("td",{style:{width:"33%",padding:"2px",border:"1px solid #ddd",verticalAlign:"top"},children:e.jsx("textarea",{id:"special-progress",style:{width:"100%",padding:"10px",borderRadius:"4px",border:"1px solid #ccc",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.1)",resize:"none",fontSize:"14px",height:"100px"},value:r?.firstSemester?.necessaryCorrections||"No data available",readonly:!0})}),e.jsx("td",{style:{padding:"2px",border:"1px solid #ddd",verticalAlign:"top"},children:e.jsx("textarea",{id:"improvements",style:{width:"100%",padding:"10px",borderRadius:"4px",border:"1px solid #ccc",boxShadow:"inset 0 1px 3px rgba(0,0,0,0.1)",resize:"none",fontSize:"14px",height:"100px"},value:r?.nondi?.necessaryCorrections||"No data available",readOnly:!0})})]})]})]}),e.jsxs("div",{className:"grade-table",children:[e.jsx("h2",{children:s==="English"?"Grade Table":"श्रेणी टेबल"}),e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="English"?"Marks":"मार्क्स"}),e.jsx("th",{children:s==="English"?"A1":"अ1"}),e.jsx("th",{children:s==="English"?"A2":"अ2"}),e.jsx("th",{children:s==="English"?"B1":"ब1"}),e.jsx("th",{children:s==="English"?"B2":"ब2"}),e.jsx("th",{children:s==="English"?"C1":"क1"}),e.jsx("th",{children:s==="English"?"C2":"क2"}),e.jsx("th",{children:s==="English"?"D1":"ड1"}),e.jsx("th",{children:s==="English"?"D2":"ड2"}),e.jsx("th",{children:s==="English"?"Absent":"अनुपस्थित"})]})}),e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{children:"%"}),e.jsx("td",{children:s==="English"?"91% to 100%":"91% ते 100%"}),e.jsx("td",{children:s==="English"?"81% to 90%":"81% ते 90%"}),e.jsx("td",{children:s==="English"?"71% to 80%":"71% ते 80%"}),e.jsx("td",{children:s==="English"?"61% to 70%":"61% ते 70%"}),e.jsx("td",{children:s==="English"?"51% to 60%":"51% ते 60%"}),e.jsx("td",{children:s==="English"?"41% to 50%":"41% ते 50%"}),e.jsx("td",{children:s==="English"?"33% to 40%":"33% ते 40%"}),e.jsx("td",{children:s==="English"?"21% to 32%":"21% ते 32%"}),e.jsx("td",{children:s==="English"?"less than 20%":"20% पेक्षा कमी"})]})})]})]})]})]})]}):e.jsxs("div",{children:[e.jsxs("div",{className:"container mt-1",children:[e.jsxs("div",{className:"left",children:[e.jsx("div",{className:"left-box",children:e.jsxs("div",{className:"school-info",children:[N&&e.jsx("div",{children:e.jsx("img",{src:N,alt:"$Logo"})}),e.jsx("h2",{children:M})]})}),e.jsx("br",{}),e.jsxs("div",{class:"student-info-grid",children:[e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Name :":"विद्यार्थ्याचे नाव :"}),e.jsxs("span",{children:[r?.studentName||"-"," ",r?.stdFather||" "," ",r?.stdSurname||" "]})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Roll No :":"हजेरी क्रमांक :"}),e.jsx("span",{children:r?.rollNo||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Exam :":"परीक्षा सत्र :"}),e.jsx("span",{children:p||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Year :":"वर्ष :"}),e.jsx("span",{children:d||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Class :":"वर्ग :"}),e.jsx("span",{children:g||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Mother Name :":"आईचे नाव :"}),e.jsx("span",{children:r?.stdMother||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"DOB :":"जन्मतारीख :"}),e.jsx("span",{children:r?.dob||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Division :":"तुकडी :"}),e.jsx("span",{children:r?.division||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Mother Tongue :":"मातृभाषा :"}),e.jsx("span",{children:r?.motherTounge||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Student ID :":"विद्यार्थी आयडी :"}),e.jsx("span",{children:r?.studentId||" "})]}),e.jsxs("p",{children:[e.jsx("label",{children:s==="English"?"Gender :":"लिंग :"}),e.jsx("span",{children:r?.gender||" "})]})]}),e.jsx("div",{className:"gradable",children:e.jsxs("table",{children:[e.jsxs("thead",{children:[e.jsxs("tr",{children:[e.jsx("th",{rowspan:"2",children:s==="English"?"Subject :":"विषय"}),e.jsx("th",{colspan:"2",children:s==="English"?"First Semester":"प्रथम सत्र"}),e.jsx("th",{colspan:"2",children:s==="English"?"Second Semester":"द्वितीय सत्र"})]}),e.jsxs("tr",{children:[e.jsx("th",{children:"Kg"}),e.jsx("th",{children:"Cm"}),e.jsx("th",{children:"Kg"}),e.jsx("th",{children:"Cm"})]})]}),e.jsxs("tbody",{children:[e.jsxs("tr",{children:[e.jsx("td",{children:s==="English"?"Weight":"वजन"}),e.jsx("td",{}),e.jsx("td",{}),e.jsx("td",{}),e.jsx("td",{})]}),e.jsxs("tr",{children:[e.jsx("td",{children:s==="English"?"Hight":"उंची"}),e.jsx("td",{}),e.jsx("td",{}),e.jsx("td",{}),e.jsx("td",{})]})]})]})})]}),e.jsxs("div",{className:"right",children:[e.jsx("h2",{children:s==="English"?"Attendance:":"हजेरी"}),e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="English"?"Type:":"प्रकार"}),T.map((t,n)=>e.jsx("th",{children:P(t)},n))]})}),e.jsx("tbody",{children:["Present","Absent","Leave"].map(t=>e.jsxs("tr",{children:[e.jsx("td",{children:B(t)}),T.map((n,i)=>e.jsx("td",{children:e.jsx("input",{type:"text",value:t==="Leave"&&S[t][n]<0?"":S[t][n]||"",onChange:a=>C(t,n,a.target.value)})},i))]},t))})]}),e.jsx("p",{style:{marginTop:"5px"},children:s==="English"?"After the winter vacation the school will start from.":"हिवाळी सुटीनंतर शाळा दि. पासून सुरू होईल."}),e.jsx("div",{style:{width:"150px"},children:e.jsx("input",{type:"date",value:xe,onChange:t=>ge(t.target.value)})}),e.jsx("div",{className:"grad",children:e.jsxs("p",{children:[s==="English"?" Instructions for parents:":"पालकांसाठी सूचना",e.jsxs("li",{children:["  ",s==="English"?" Students should wear school uniform every day.":"विद्यार्थ्यांनी दररोज शालेय गणवेश परिधान करावा."]}),e.jsxs("li",{children:[" ",s==="English"?"  A student should do the study given in school every day.":"विद्यार्थ्याने शाळेत दिलेला अभ्यास दररोज करावा."]}),e.jsxs("li",{children:[" ",s==="English"?" Students should attend school on time and regularly every day.":"विद्यार्थ्यांनी दररोज वेळेवर व नियमितपणे शाळेत हजर राहावे."]}),e.jsxs("li",{children:[" ",s==="English"?" Students should not carry valuables, money. ":"विद्यार्थ्यांनी मौल्यवान वस्तू, पैसे घेऊन जाऊ नये."]}),e.jsxs("li",{children:["  ",s==="English"?" Students should follow the rules and discipline of the school. ":"विद्यार्थ्यांनी शाळेचे नियम व शिस्तीचे पालन करावे."]})]})}),e.jsx("p",{style:{marginTop:"70px",marginLeft:"350px"},children:s==="English"?"Parents Signature ":"पालकांची सही"})]})]}),e.jsxs("div",{className:"container mt-1",children:[e.jsxs("div",{className:"left",children:[e.jsx("h2",{children:s==="English"?" Student Progress Report":"विद्यार्थी प्रगती अहवाल"}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"roll-no",children:s==="English"?" Roll No:":"हजेरी क्रमांक:"}),e.jsx("span",{children:r?.rollNo||" "})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"student-name",children:s==="English"?" Student Name:":"विद्यार्थ्याचे नाव:"}),e.jsxs("span",{children:[r?.studentName||" "," ",r?.stdFather||" "," ",r?.stdSurname||" "]})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"class",children:s==="English"?" Class:":"वर्ग:"}),e.jsx("span",{children:g||" "})]}),e.jsxs("div",{children:[e.jsx("label",{htmlFor:"exam-roll-no",children:s==="English"?" Exam:":"परीक्षा:"}),e.jsx("span",{children:p||" "})]}),r?.results?e.jsxs("table",{className:"table table-striped table-bordered",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="English"?"Subject":"विषय"}),e.jsx("th",{children:s==="English"?"Grade":"श्रेणी"})]})}),e.jsx("tbody",{children:O.filter((t,n)=>t&&n!==0).map(t=>{const{grade:n}=r.results[t]||{};return e.jsxs("tr",{children:[e.jsx("td",{children:e.jsx("b",{children:t})}),e.jsx("td",{children:e.jsx("b",{children:n||"Absent"})})]},t)})})]}):e.jsx("p",{children:s==="English"?"No results available.":"कोणतेही प्रगतीपत्रक उपलब्ध नाहीत."}),e.jsx("div",{}),e.jsxs("div",{className:"grad",style:{display:"flex",alignItems:"center"},children:[e.jsx("label",{style:{marginRight:"20px",marginBottom:"2px",marginLeft:"20px"},htmlFor:"class-teacher",children:s==="English"?"Class Teacher":"वर्गशिक्षक"}),e.jsx("label",{style:{marginRight:"20px",marginBottom:"2px",marginLeft:"45%"},htmlFor:"principal",children:s==="English"?"Principal":"प्राचार्य"})]})]}),e.jsxs("div",{className:"right",children:[e.jsx("h2",{children:s==="English"?"Nondi":"नोंदी"}),e.jsxs("table",{children:[e.jsxs("tr",{children:[e.jsx("th",{style:{width:"33%"},children:s==="English"?"Special Progress:":"विशेष प्रगती:"}),e.jsx("th",{style:{width:"33%"},children:s==="English"?"Hobbies:":"छंद:"}),e.jsx("th",{style:{width:"33%"},children:s==="English"?"Required Improvements:":"आवश्यक सुधारणा:"})]}),e.jsxs("tr",{children:[e.jsx("td",{style:{width:"33%"},children:e.jsx("div",{id:"special-progress",style:{height:"150px",overflowY:"auto",padding:"10px",border:"1px solid black"},contentEditable:"false",suppressContentEditableWarning:!0,children:r?.nondi?.specialEntries||""})}),e.jsx("td",{style:{width:"33%"},children:e.jsx("div",{id:"hobbies",style:{height:"150px",overflowY:"auto",padding:"10px",border:"1px solid black"},contentEditable:"false",suppressContentEditableWarning:!0,children:r?.nondi?.interestsAndHobbies||""})}),e.jsx("td",{style:{width:"33%"},children:e.jsx("div",{id:"improvements",style:{height:"150px",overflowY:"auto",padding:"10px",border:"1px solid black"},contentEditable:"false",suppressContentEditableWarning:!0,children:r?.nondi?.necessaryCorrections||""})})]})]}),e.jsxs("div",{className:"grade-table",children:[e.jsx("h2",{children:s==="English"?"Grade Table":"श्रेणी टेबल"}),e.jsxs("table",{children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:s==="English"?"Marks":"मार्क्स"}),e.jsx("th",{children:s==="English"?"A1":"अ-1"}),e.jsx("th",{children:s==="English"?"A2":"अ-2"}),e.jsx("th",{children:s==="English"?"B1":"ब-1"}),e.jsx("th",{children:s==="English"?"B2":"ब-2"}),e.jsx("th",{children:s==="English"?"C1":"क-1"}),e.jsx("th",{children:s==="English"?"C2":"क-2"}),e.jsx("th",{children:s==="English"?"D1":"ड-1"}),e.jsx("th",{children:s==="English"?"D2":"ड-2"}),e.jsx("th",{children:s==="English"?"Absent":"अनुपस्थित"})]})}),e.jsx("tbody",{children:e.jsxs("tr",{children:[e.jsx("td",{children:"%"}),e.jsx("td",{children:s==="English"?"91% to 100%":"91% ते 100%"}),e.jsx("td",{children:s==="English"?"81% to 90%":"81% ते 90%"}),e.jsx("td",{children:s==="English"?"71% to 80%":"71% ते 80%"}),e.jsx("td",{children:s==="English"?"61% to 70%":"61% ते 70%"}),e.jsx("td",{children:s==="English"?"51% to 60%":"51% ते 60%"}),e.jsx("td",{children:s==="English"?"41% to 50%":"41% ते 50%"}),e.jsx("td",{children:s==="English"?"33% to 40%":"33% ते 40%"}),e.jsx("td",{children:s==="English"?"21% to 32%":"21% ते 32%"}),e.jsx("td",{children:s==="English"?"less than 20%":"20% पेक्षा कमी"})]})})]})]})]})]})]})}),e.jsx(L.Footer,{children:e.jsx(me,{variant:"primary",onClick:pe,children:s==="English"?"Print":"Print करा"})})]}),e.jsx("style",{jsx:!0,children:`
      .modal.show .modal-dialog {
  transform: auto; 
      }
      `})]})]})};function De(){const{udiseNumber:E,srNo:h,academicYear:x,classValue:d,selectedExamName:g}=ue.useParams();return e.jsx(Ee,{initialEntries:[`/webResult/${E}/${h}/${x}/${d}/${g}`],children:e.jsx(Se,{children:e.jsx(Ae,{path:"/webResult/:udiseNumber/:srNo/:academicYear/:classValue/:selectedExamName",element:e.jsx(ye,{})})})})}export{De as component};
