
using Cws.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Cws.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Batch> Batches => Set<Batch>();
    public DbSet<Material> Materials => Set<Material>();
    public DbSet<MaterialParameter> MaterialParameters => Set<MaterialParameter>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Batch configuration
        modelBuilder.Entity<Batch>(entity =>
        {
            entity.ToTable("cws_demo_batches", "public");

            entity.HasKey(e => e.BatchId);

            entity.Property(e => e.BatchId).HasColumnName("batch_id");
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.OwnerDisplayName).HasColumnName("owner_display_name");
            entity.Property(e => e.OwnerEmail).HasColumnName("owner_email");
            entity.Property(e => e.MaterialCode).HasColumnName("material_code");
            entity.Property(e => e.MaterialRevision).HasColumnName("material_revision");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.ErrorMode).HasColumnName("error_mode");
            entity.Property(e => e.SkipMode).HasColumnName("skip_mode");

            entity.Property(e => e.SuccessRate)
                .HasColumnName("success_rate")
                .HasPrecision(5, 2);

            entity.Property(e => e.LastRunAt).HasColumnName("last_run_at");
            entity.Property(e => e.BatchSize).HasColumnName("batch_size");
            entity.Property(e => e.Shared).HasColumnName("shared");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
            entity.Property(e => e.UpdatedAt).HasColumnName("updated_at");
            entity.Property(e => e.IsDemo).HasColumnName("is_demo");
        });

        // Material configuration
        modelBuilder.Entity<Material>(entity =>
        {
            entity.ToTable("cws_demo_materials", "public");

            entity.HasKey(e => new { e.MaterialCode, e.Revision });

            entity.Property(e => e.MaterialCode).HasColumnName("material_code");
            entity.Property(e => e.Revision).HasColumnName("revision");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.PdmDescription).HasColumnName("pdm_description");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");
        });

        // Material Parameter configuration
        modelBuilder.Entity<MaterialParameter>(entity =>
        {
            entity.ToTable("cws_demo_material_parameters", "public");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedOnAdd();

            entity.Property(e => e.MaterialCode).HasColumnName("material_code");
            entity.Property(e => e.Revision).HasColumnName("revision");
            entity.Property(e => e.ParameterName).HasColumnName("parameter_name");
            entity.Property(e => e.ParameterType).HasColumnName("parameter_type");
            entity.Property(e => e.DefaultValue).HasColumnName("default_value");
            entity.Property(e => e.Unit).HasColumnName("unit");
            entity.Property(e => e.IsRequired).HasColumnName("is_required");
            entity.Property(e => e.DisplayOrder).HasColumnName("display_order");
        });

        // Order configuration
        modelBuilder.Entity<Order>(entity =>
        {
            entity.ToTable("cws_demo_orders", "public");

            entity.HasKey(e => e.OrderId);

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.BatchId).HasColumnName("batch_id");
            entity.Property(e => e.SequenceNo).HasColumnName("sequence_no");
            entity.Property(e => e.ConfigurationId).HasColumnName("configuration_id");
            entity.Property(e => e.OrderStatus).HasColumnName("order_status");
            entity.Property(e => e.ErrorModeMessage).HasColumnName("error_mode_message");
            entity.Property(e => e.CadConfigurationSeconds).HasColumnName("cad_configuration_seconds");
            entity.Property(e => e.CadRegenerationLoops).HasColumnName("cad_regeneration_loops");
            entity.Property(e => e.ResultFileAvailable).HasColumnName("result_files_available");
            entity.Property(e => e.CreatedAt).HasColumnName("created_at");

            entity.HasIndex(e => new { e.BatchId, e.SequenceNo })
                .IsUnique()
                .HasDatabaseName("cws_demo_order_position_unique");

            entity.HasOne<Batch>()
                .WithMany()
                .HasForeignKey(e => e.BatchId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
