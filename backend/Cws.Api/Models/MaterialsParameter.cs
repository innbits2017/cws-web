
namespace Cws.Api.Models;

public class MaterialParameter
{
    public long Id { get; set; }

    public string MaterialCode { get; set; } = string.Empty;

    public string Revision { get; set; } = string.Empty;

    public string ParameterName { get; set; } = string.Empty;

    public string ParameterType { get; set; } = string.Empty;

    public string DefaultValue { get; set; } = string.Empty;

    public string? Unit { get; set; }

    public bool IsRequired { get; set; }

    public int DisplayOrder { get; set; }
}
