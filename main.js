//---- ---- ---- ---- html functions

//getElementbyID but shorter
function POwO_docgetel(InString)
{
    return document.getElementById(InString);
}

//---- ---- ---- ---- math functions

//math clamping
function POwO_Math_Clamp(InMin, InVal, InMax)
{
    
    //return Math.max(InMin, Math.min(InVal, InMax) );
    if (InVal > InMax)
    {
        return InMax;
    }
    else if (InVal < InMin)
    {
        return InMin;
    }
    else
    {
        return InVal;
    }

}

//math lerping
function POwO_Math_LERP(A, B, t)
{
    return (B-A) * t + A
}

//math lerping rev
function POwO_Math_LERPinv(A,B,V)
{
    let ReturnResult = 0;

    if (A==B)
    {
        ReturnResult = A;
    }
    else
    {
        ReturnResult = (V-A) / (B-A) 
    }
    
    return ReturnResult;
}

//math lerp Mapping
function POwO_Math_LERPmap(a,b,v,A,B)
{
    let t = POwO_Math_LERPinv(a,b,v);
    return POwO_Math_LERP(A,B,t);
}

function POwO_Math_DegToRad(inDeg)
{
    return Math.PI * 2 * inDeg / 360
}

function POwO_Math_IsInRange_Exclusive(inMin, inVal, inMax)
{
    return inMin < inVal && inVal < inMax
}




// ---- ---- ---- ---- SETUP

const canvas = document.getElementById("kanvas");
const ctx = canvas.getContext("2d");
const HTML_Body = POwO_docgetel("HTML_body")

var field_checkBox_showR_Line = POwO_docgetel("field_checkBox_showR_Line");
var field_checkBox_showX_Line = POwO_docgetel("field_checkBox_showX_Line");
var field_checkBox_showY_Line = POwO_docgetel("field_checkBox_showY_Line");

var field_checkBox_showR_Tag = POwO_docgetel("field_checkBox_showR_Tag");
var field_checkBox_showX_Tag = POwO_docgetel("field_checkBox_showX_Tag");
var field_checkBox_showY_Tag = POwO_docgetel("field_checkBox_showY_Tag");

var field_checkBox_showAngle_Total = POwO_docgetel("field_checkBox_showAngle_Total")
var field_checkBox_showAngle_Acute = POwO_docgetel("field_checkBox_showAngle_Acute")

var field_checkBox_snap = POwO_docgetel("field_checkBox_snap");

var field_textBox_Radius = POwO_docgetel("field_textBox_Radius");
var field_text_tanθ = POwO_docgetel("field_text_tanθ")

var GLOBAL_RingRadius = 320
var GLOBAL_TickMarkSize = 20
var GLOBAL_Angle = 60/360 * 2 * Math.PI
var GLOBAL_HandleRadius = 16
var GLOBAL_Handle2Radius = 8
var GLOBAL_TickMarkTextOffset = 30

var GLOBAL_MarkCount = 16 // how many duplicates ?
var GLOBAL_ModulusSize = 11 

var GLOBAL_CenterX = canvas.width / 2
var GLOBAL_CenterY = canvas.height / 2
var GLOBAL_isHold = false


class ShOwOpe
{
    constructor(inPosX, inPosY, inPosZ, inType, inParam0, inParam1, inColorStroke, inStrokeWidth, inColorFill)
    {
        this.PosX = inPosX
        this.PosY = inPosY
        this.PosZ = inPosZ
        this.Type = inType
        this.Param0 = inParam0
        this.Param1 = inParam1
        this.ColorStroke = inColorStroke
        this.StrokeWidth = inStrokeWidth
        this.ColorFill = inColorFill
    }

    drawMe(inKanvasContext)
    {
        inKanvasContext.beginPath()

        switch (this.Type)
        {

            case "circle":
                inKanvasContext.arc(this.PosX, this.PosY, this.Param0, 0, Math.PI * 2);
            break;

            case "rect" :
                let temp_RadiusX = this.Param0 / 2
                let temp_RadiusY = this.Param1 / 2
                inKanvasContext.rect(this.PosX - temp_RadiusX , this.PosY - temp_RadiusY , this.Param0, this.Param1);
            break;
        
            default:
            break;
        }

        inKanvasContext.fillStyle = this.ColorFill;
        inKanvasContext.strokeStyle = this.ColorStroke;
        inKanvasContext.lineWidth = this.StrokeWidth;

        inKanvasContext.fill();
        inKanvasContext.stroke();
    }

    isInside(mouseX, mouseY)
    {
        switch(this.Type)
        {
            case "circle":
                let dx = mouseX - this.PosX;
                let dy = mouseY - this.PosY;
                return (dx*dx + dy*dy) <= (this.Param0*this.Param0);
            break;

            case "rect":
                let temp_RadiusX = this.Param0 / 2
                let temp_RadiusY = this.Param1 / 2

                return (
                    mouseX >= this.PosX - temp_RadiusX &&
                    mouseX <= this.PosX + temp_RadiusX &&
                    mouseY >= this.PosY - temp_RadiusY &&
                    mouseY <= this.PosY + temp_RadiusY
                );
            break;

            default: return false; break;
        }

        return false;
    }
}




// ---- ---- ---- ---- page function

function POwO_getMouse(event)
{
    const rect = canvas.getBoundingClientRect();

    return {
        temp_mouseX: event.clientX - rect.left,
        temp_mouseY: event.clientY - rect.top
    };
}

function POwO_Angle_Snap(inAngle)
{
    let outAngle = inAngle
    for(let i = POwO_Math_DegToRad(-180 - 7.5) ; i <  POwO_Math_DegToRad(-172.5 + 360) ; i += POwO_Math_DegToRad(15))
    {
        if ( POwO_Math_IsInRange_Exclusive(i, outAngle , i + POwO_Math_DegToRad(15))){ outAngle = i + POwO_Math_DegToRad( 7.5 ) }
    }
    return outAngle;
}

function POwO_fromMousePosToAngle(inMouseX, inMouseY)
{
    let temp_Angle = Math.atan2(GLOBAL_CenterY - inMouseY, inMouseX - GLOBAL_CenterX )
    if (field_checkBox_snap.checked)
    {
        temp_Angle = POwO_Angle_Snap(temp_Angle)
    }
    return temp_Angle
}

function POwO_Kanvas_DrawTag(inX, inY, inW, inH, inR, inTagColor, inTextString, inTextColor, inTextFont)
{
    //first the tag
    ctx.beginPath()
    ctx.fillStyle = inTagColor
    ctx.roundRect( inX - inW/2 , inY - inH/2 , inW, inH, inR )
    ctx.fill()

    //then the text
    ctx.font = inTextFont
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = inTextColor
    ctx.fillText(inTextString, inX, inY)
}

function POwO_RedrawAll()
{
    

    let temp_deltaX = GLOBAL_RingRadius * Math.cos(GLOBAL_Angle)
    let temp_deltaY = Math.sin(GLOBAL_Angle) * GLOBAL_RingRadius

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //draw the main ring
    ctx.beginPath();
    ctx.arc( GLOBAL_CenterX , GLOBAL_CenterY , GLOBAL_RingRadius, 0, Math.PI * 2); // Radius is the center of the ring's thickness
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    //text ready
    ctx.font = "20px Calibri"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    

    //draw tickmarks for the modulus
    ctx.strokeStyle = "#FFFFFF"
    for(let i = 0 ; i < GLOBAL_ModulusSize ; i++)
    {
        let temp_i_angle = i / GLOBAL_ModulusSize * Math.PI * 2

        ctx.beginPath();
        ctx.moveTo( GLOBAL_CenterX + GLOBAL_RingRadius * Math.cos(temp_i_angle) , GLOBAL_CenterY - GLOBAL_RingRadius * Math.sin(temp_i_angle) )
        ctx.lineWidth = 3
        ctx.strokeStyle = "rgba(255,255,255,1)"
        ctx.fillStyle = "#FFFFFF"
        ctx.lineTo( GLOBAL_CenterX + (GLOBAL_RingRadius + GLOBAL_TickMarkSize) * Math.cos(temp_i_angle) , GLOBAL_CenterY - (GLOBAL_RingRadius + GLOBAL_TickMarkSize) * Math.sin(temp_i_angle) )
        ctx.stroke()
        ctx.fillText(i.toString(), GLOBAL_CenterX + (GLOBAL_RingRadius + GLOBAL_TickMarkTextOffset) * Math.cos(temp_i_angle) , GLOBAL_CenterY - ( GLOBAL_RingRadius + GLOBAL_TickMarkTextOffset ) * Math.sin(temp_i_angle))
    }
    
    //draw handles and the duplicated ones
    for(let i = 0 ; i < GLOBAL_MarkCount ; i++)
    {
        let temp_i_angle = i * GLOBAL_Angle
        let temp_x = GLOBAL_RingRadius * Math.cos(temp_i_angle)
        let temp_y = GLOBAL_RingRadius * Math.sin(temp_i_angle)

        ctx.beginPath();
        if (i === 1){ctx.lineWidth = 30}else{ctx.lineWidth = 0.01};
        ctx.fillStyle = '#FFC000';
        ctx.strokeStyle = "rgba(255,192,0,0.25)"
        ctx.arc( GLOBAL_CenterX + temp_x , GLOBAL_CenterY - temp_y , GLOBAL_HandleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        POwO_Kanvas_DrawTag(GLOBAL_CenterX + temp_x, GLOBAL_CenterY - temp_y, 50, 50,0, "rgba(0,0,0,0)",i.toString(),"#000","20px Calibri")
    }
}





canvas.addEventListener("mousedown", (event) => {

    const { temp_mouseX, temp_mouseY } = POwO_getMouse(event);
    GLOBAL_Angle = POwO_fromMousePosToAngle( temp_mouseX , temp_mouseY)
    
    GLOBAL_isHold = true
    POwO_RedrawAll();
});

canvas.addEventListener("mousemove", (event) => {

    if (GLOBAL_isHold)
    {
        const { temp_mouseX, temp_mouseY } = POwO_getMouse(event);

        GLOBAL_Angle = POwO_fromMousePosToAngle( temp_mouseX , temp_mouseY)
        POwO_RedrawAll();
    }
});

canvas.addEventListener("mouseup", () => {
    GLOBAL_isHold = false
});

HTML_Body.addEventListener("mouseup", () => {
    
});

window.addEventListener("message",(event) => {
    let getAngle = event.data / 360 * Math.PI * 2

    if (field_checkBox_snap.checked)
    {
        getAngle = POwO_Angle_Snap(getAngle)
    }

    GLOBAL_Angle = getAngle
    POwO_RedrawAll();
})


// ---- ---- ---- ---- RUN MAIN
POwO_RedrawAll()


