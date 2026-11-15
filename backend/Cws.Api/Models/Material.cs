
namespace Cws.Api.Models;

public class Material
{
    // Composite primary key: material_code + revision

    public string MaterialCode { get; set; } = string.Empty;

    public string Revision { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string PdmDescription { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; }
}
