<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="addCateClick">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        show-index
        index-text="#"
        :selection-type="false"
        :expand-type="false"
        border
      >
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
            style="color: lightgreen"
          ></i>
          <i v-else class="el-icon-error"></i>
        </template>
        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag
            v-else-if="scope.row.cat_level === 1"
            type="success"
            size="mini"
            >二级</el-tag
          >
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            @click="compileClick(scope.row)"
            size="mini"
            type="primary"
            icon="el-icon-edit"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="deleteClick(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRule"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- 选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderPropa"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类信息"
      :visible.sync="compileDialogVisible"
      width="50%"
      @close="compileCateDialogClosed"
    >
      <el-form
        :model="compileForm"
        :rules="addCateFormRule"
        ref="compileCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="compileForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="compileDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="compileCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Cate",
  data() {
    return {
      // 请求商品分类的参数
      querInfo: {
        type: 3,
        // 当前页码值
        pagenum: 1,
        // 每页显示几条数据
        pagesize: 5,
      },
      // 商品分类数据
      cateList: [],
      // 总条数
      total: 0,
      // 表格渲染参数
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      // 显示隐藏添加分类对话框
      addCateDialogVisible: false,
      // 添加分类表单
      addCateForm: {
        // 分类名称
        cat_name: "",
        // 分类父id
        cat_pid: 0,
        // 分类层次
        cat_level: 0,
      },
      // 添加分类表单的验证规则
      addCateFormRule: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 父级分类数据
      parentCateList: [],
      // 级联选择器配置对象
      cascaderPropa: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
        checkStrictly: true,
      },
      // 选中父级分类id
      selectedKeys: [],
      // 编辑对话框显示隐藏
      compileDialogVisible: false,
      // 编辑表单
      compileForm: {
        cat_name: "",
        id: "",
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 请求商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败");
      }
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    // 修改每页显示数据条数
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    // 点击改变页面值
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击添加分类
    addCateClick() {
      // 调用获取父级分类数据
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 请求父级分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败");
      }
      this.parentCateList = res.data;
    },
    // 联级选择器发生变化
    parentCateChange() {
      // selectedKeys 中长度大于0 则说明有选择分级分类 反之没有
      if (this.selectedKeys.length > 0) {
        // 父级分类id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        // 当前分类层次
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 父级分类id
        this.addCateForm.cat_pid = 0;
        // 当前层次
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击确定 添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败");
        }
        this.$message.success("添加分类成功");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    // 关闭添加分类事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 点击编辑按钮
    compileClick(info) {
      this.compileForm.cat_name = info.cat_name;
      this.compileForm.id = info.cat_id;
      this.compileDialogVisible = true;
    },
    // 确定提交编辑
    compileCate() {
      console.log(this.compileForm);
      this.$refs.compileCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.compileForm.id}`,
          {
            cat_name: this.compileForm.cat_name,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("更新编辑失败");
        }
        this.$message.success("更新编辑成功");
        this.getCateList();
        this.compileDialogVisible = false;
      });
    },
    // 关闭编辑对话框
    compileCateDialogClosed() {
      this.$refs.compileCateFormRef.resetFields();
      this.compileForm.id = "";
      this.compileForm.cat_name = "";
    },
    // 点击删除按钮
    async deleteClick(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该分类, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((res) => res);
      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      } else {
        this.$message.success("删除成功");
        this.querInfo.pagenum = Math.ceil(
          (this.total - 1) / this.querInfo.pagesize
        );
        this.getCateList();
      }
    },
  },
};
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>