class  MultiplePassOutlineMaterial extends Laya.BaseMaterial {
    
    /**@private */
    static shaderDefines = new Laya.ShaderDefines(Laya.BaseMaterial.shaderDefines);
    
    /**
     * @private
     */
    static __init__() {
        MultiplePassOutlineMaterial.SHADERDEFINE_ALBEDOTEXTURE = MultiplePassOutlineMaterial.shaderDefines.registerDefine("ALBEDOTEXTURE");
    }
    /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    get albedoTexture() {
        return this._shaderValues.getTexture(MultiplePassOutlineMaterial.ALBEDOTEXTURE);
    }
    
    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
    set albedoTexture(value) {
        if (value)
            this._defineDatas.add(MultiplePassOutlineMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._defineDatas.remove(MultiplePassOutlineMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        this._shaderValues.setTexture(MultiplePassOutlineMaterial.ALBEDOTEXTURE, value);
    }
    /**
     * 获取线条颜色
     * @return 线条颜色
     */
    get outlineColor() {
        return _shaderValues.getVector(MultiplePassOutlineMaterial.OUTLINECOLOR);
    }
    
    set outlineColor(value) {
        _shaderValues.setVector(MultiplePassOutlineMaterial.OUTLINECOLOR, value);
    }
    /**
     * 获取轮廓宽度。
     * @return 轮廓宽度,范围为0到0.05。
     */
    get outlineWidth() {
        return this._shaderValues.getNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH);
    }
    
    /**
     * 设置轮廓宽度。
     * @param value 轮廓宽度,范围为0到0.05。
     */
    set outlineWidth(value) {
        value = Math.max(0.0, Math.min(0.05, value));
        this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH, value);
    }
    
    /**
     * 获取轮廓亮度。
     * @return 轮廓亮度,范围为0到1。
     */
    get outlineLightness() {
        return this._shaderValues.getNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS);
    }
    
    /**
     * 设置轮廓亮度。
     * @param value 轮廓亮度,范围为0到1。
     */
    set outlineLightness(value) {
        value = Math.max(0.0, Math.min(1.0, value));
        this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, value);
    }
    
    
    static initShader() {
        MultiplePassOutlineMaterial.__init__();
        var attributeMap = {'a_Position':  Laya.VertexMesh.MESH_POSITION0, 
									   'a_Normal':  Laya.VertexMesh.MESH_NORMAL0, 
									   'a_Texcoord0':  Laya.VertexMesh.MESH_TEXTURECOORDINATE0
									};
	    var uniformMap = {'u_MvpMatrix':  Laya.Shader3D.PERIOD_SPRITE, 
									 'u_WorldMat':  Laya.Shader3D.PERIOD_SPRITE,
                                     'u_OutlineWidth':  Laya.Shader3D.PERIOD_MATERIAL, 
                                     'u_OutlineColor': Laya.Shader3D.PERIOD_MATERIAL,
									 'u_OutlineLightness':  Laya.Shader3D.PERIOD_MATERIAL,
									 'u_AlbedoTexture':  Laya.Shader3D.PERIOD_MATERIAL
									};
                                
        var customShader = Laya.Shader3D.add("MultiplePassOutlineShader");
        var subShader = new Laya.SubShader(attributeMap, uniformMap,MultiplePassOutlineMaterial.shaderDefines);
        customShader.addSubShader(subShader);
        let vs1 = "attribute vec4 a_Position;\n" + 
        "attribute vec3 a_Normal;\n" + 
        
        "uniform mat4 u_MvpMatrix;\n" + 
        "uniform float u_OutlineWidth;\n" + 

        
        "void main()\n" + 
        "{\n" + 
        "   vec4 position = vec4(a_Position.xyz + a_Normal * u_OutlineWidth, 1.0);\n" + 
        "   gl_Position = u_MvpMatrix * position;\n" + 
        "}\n" ;

        let ps1 = "#ifdef FSHIGHPRECISION\n" + 
        "precision highp float;\n" + 
        "#else\n" + 
        "   precision mediump float;\n" + 
        "#endif\n" + 
        "uniform vec4 u_OutlineColor;\n" + 
        "uniform float u_OutlineLightness;\n" + 
    
        "void main()\n" + 
        "{\n" + 
        "   vec3 finalColor = u_OutlineColor.rgb * u_OutlineLightness;\n" + 
        
        "   gl_FragColor = vec4(finalColor,0.0);\n" + 
        "}";
    
        var pass1 = subShader.addShaderPass(vs1, ps1);
        pass1.renderState.cull = Laya.RenderState.CULL_FRONT;
        let vs2 = '#include "Lighting.glsl";\n' + 

        "attribute vec4 a_Position;\n" + 
        "attribute vec2 a_Texcoord0;\n" + 
        
        "uniform mat4 u_MvpMatrix;\n" + 
        "uniform mat4 u_WorldMat;\n" + 
        
        
        "attribute vec3 a_Normal;\n" + 
        "varying vec3 v_Normal;\n" + 
        "varying vec2 v_Texcoord0;\n" + 
        
        "void main()\n" + 
        "{\n" + 
        "   gl_Position = u_MvpMatrix * a_Position;\n" + 
              
        "   mat3 worldMat=mat3(u_WorldMat);\n" + 
        "   v_Normal=worldMat*a_Normal;\n" + 
        "   v_Texcoord0 = a_Texcoord0;\n" + 
        "   gl_Position=remapGLPositionZ(gl_Position);\n" + 
        "}\n" 
        let ps2 = "#ifdef FSHIGHPRECISION\n" + 
        "precision highp float;\n" +
        "#else\n" +
        "precision mediump float;\n" +
        "#endif\n" +
        "varying vec2 v_Texcoord0;\n" +
        "varying vec3 v_Normal;\n" +
        
        "uniform sampler2D u_AlbedoTexture;\n" +
        
        
        "void main()\n" +
        "{\n" +
        "   vec4 albedoTextureColor = vec4(1.0);\n" +
           
        "   albedoTextureColor = texture2D(u_AlbedoTexture, v_Texcoord0);\n" +
        "   gl_FragColor=albedoTextureColor;\n" +
        "}\n" 
        
        subShader.addShaderPass(vs2, ps2);
    }
    

    
    constructor() {
        super();
        this.setShaderName("MultiplePassOutlineShader");
        this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINEWIDTH, 0.01581197);
        this._shaderValues.setNumber(MultiplePassOutlineMaterial.OUTLINELIGHTNESS, 1);
        this._shaderValues.setVector(MultiplePassOutlineMaterial.OUTLINECOLOR, new Laya.Vector4(1.0,1.0,1.0,0.0));
    }
}

MultiplePassOutlineMaterial.ALBEDOTEXTURE = Laya.Shader3D.propertyNameToID("u_AlbedoTexture");
MultiplePassOutlineMaterial.OUTLINECOLOR = Laya.Shader3D.propertyNameToID("u_OutlineColor");
MultiplePassOutlineMaterial.OUTLINEWIDTH = Laya.Shader3D.propertyNameToID("u_OutlineWidth");
MultiplePassOutlineMaterial.OUTLINELIGHTNESS = Laya.Shader3D.propertyNameToID("u_OutlineLightness");
    
MultiplePassOutlineMaterial.SHADERDEFINE_ALBEDOTEXTURE;
